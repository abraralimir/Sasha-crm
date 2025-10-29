import { notFound } from "next/navigation";
import { getLeadById } from "@/lib/data";
import { LeadDetails } from "@/components/leads/lead-details";
import { RoiPrediction } from "@/components/leads/roi-prediction";
import { TimelineGenerator } from "@/components/leads/timeline-generator";
import { RiskAnalysis } from "@/components/leads/risk-analysis";
import { ActivityFeed } from "@/components/leads/activity-feed";

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = getLeadById(params.id);

  if (!lead) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <LeadDetails lead={lead} />
      <div className="grid gap-6 lg:grid-cols-3">
         <div className="lg:col-span-2 space-y-6">
            <TimelineGenerator lead={lead} />
            <RiskAnalysis lead={lead} />
         </div>
         <div className="space-y-6">
            <RoiPrediction lead={lead} />
            <ActivityFeed />
         </div>
      </div>
    </div>
  );
}
