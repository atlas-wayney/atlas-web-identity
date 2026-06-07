import { ConfigsPage } from "atlas-shared-web";
import { API_BASE } from "../../lib/config";

export default function Configs() {
  return <ConfigsPage apiEndpoint={`${API_BASE}/identity/atlas-configs/v1`} />;
}
