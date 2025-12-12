

export default $config({
    app(input) {
      return {
        name: "autoprune",
        home: "aws",
        providers: {
          aws: {
            region: "us-east-1"
          }
        }
      };
    },
    async run() {
      // 1. Create the Go Backend
      const api = new sst.aws.Function("AutopruneApi", {
        handler: "functions/autoprune.go",
        runtime: "go",
        url: true,
        permissions: [
          {
            actions: ["ec2:*"],
            resources: ["*"],
          },
        ],
      });
  
      // 2. Create the Next.js Frontend
      new sst.aws.Nextjs("AutopruneWeb", {
        link: [api],
      });
    },
  });