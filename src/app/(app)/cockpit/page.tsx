import { redirect } from "next/navigation";

/** Legacy route — canonical deal cockpit lives under `/deals/[id]/cockpit`. */
export default function LegacyCockpitRedirect() {
  redirect("/deals/demo/cockpit");
}
