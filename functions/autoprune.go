package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/ec2"
	"github.com/aws/aws-sdk-go-v2/service/ec2/types"
)

// Data structure for our response
type ZombieVolume struct {
	VolumeId      string  `json:"VolumeId"`
	Size          int32   `json:"Size"`
	PricePerMonth float64 `json:"PricePerMonth"`
	State         string  `json:"State"`
}
  
type RequestBody struct {
	Action string `json:"action"`
}

func HandleRequest(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// 1. Load AWS Configuration
	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		return errorResponse("Failed to load AWS config: " + err.Error()), nil
	}
	client := ec2.NewFromConfig(cfg)

	// 2. Parse User Action (Scan vs Delete)
	var reqBody RequestBody
	if request.Body != "" {
		if err := json.Unmarshal([]byte(request.Body), &reqBody); err != nil {
			log.Printf("Failed to parse request body: %v", err)
		}
	}
	action := reqBody.Action
	if action == "" {
		action = "scan"
	}

	// 3. Scan for "Available" (Zombie) volumes
	input := &ec2.DescribeVolumesInput{
		Filters: []types.Filter{
			{
				Name:   aws.String("status"),
				Values: []string{"available"},
			},
		},
	}

	result, err := client.DescribeVolumes(ctx, input)
	if err != nil {
		return errorResponse("Failed to fetch volumes: " + err.Error()), nil
	}

	var zombies []ZombieVolume
	deletedCount := 0

	// 4. Process Volumes
	for _, v := range result.Volumes {
		z := ZombieVolume{
			VolumeId:      *v.VolumeId,
			Size:          *v.Size,
			PricePerMonth: float64(*v.Size) * 0.08, // Approx $0.08/GB
			State:         string(v.State),
		}

		if action == "delete" {
			// --- DELETION LOGIC ---
			_, err := client.DeleteVolume(ctx, &ec2.DeleteVolumeInput{
				VolumeId: v.VolumeId,
			})
			if err == nil {
				deletedCount++
				// Only add to list if successfully deleted or scanned
				zombies = append(zombies, z) 
			} else {
				log.Printf("Failed to delete %s: %v", *v.VolumeId, err)
			}
		} else {
			// Just Scanning
			zombies = append(zombies, z)
		}
	}

	// 5. Create Response
	message := fmt.Sprintf("Scan complete. Found %d zombies.", len(zombies))
	if action == "delete" {
		message = fmt.Sprintf("Prune complete. Deleted %d volumes.", deletedCount)
	}

	responseBody, _ := json.Marshal(map[string]interface{}{
		"message": message,
		"zombies": zombies,
	})

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers: map[string]string{
			"Content-Type":                "application/json",
			"Access-Control-Allow-Origin": "*",
		},
		Body: string(responseBody),
	}, nil
}

func errorResponse(msg string) events.APIGatewayProxyResponse {
	return events.APIGatewayProxyResponse{
		StatusCode: 500,
		Headers: map[string]string{
			"Content-Type":                "application/json",
			"Access-Control-Allow-Origin": "*",
		},
		Body: fmt.Sprintf(`{"error": "%s"}`, msg),
	}
}

func main() {
	lambda.Start(HandleRequest)
}