import { Resource } from "sst";
import AutoPruneClient from "./components/AutoPruneClient";

export default function Home() {
  // Try to get the API URL from SST Resource
  // If it fails, pass undefined and let the client component handle it
  let apiUrl: string | undefined;
  try {
    apiUrl = Resource.AutopruneApi.url;
  } catch (error) {
    // Resource not available - will be handled by client component
    console.warn("SST Resource not available:", error);
    apiUrl = undefined;
  }
  
  return <AutoPruneClient apiUrl={apiUrl} />;
}




