import React from 'react';
import { MotionDiv } from '.';
import { LucideIcon } from 'lucide-react';

interface InfoCardProps {
  Icon: LucideIcon;
  title: string;
  description: string;
  accent?: string;
}

export default function InfoCard({ Icon, title, description, accent = 'bg-nee-500' }: InfoCardProps) {
  return (
    <MotionDiv
      whileHover={{ translateY: -6 }}
      className="info-card group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-white/3 to-white/2 border border-white/6 shadow-lg"
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${accent} shadow-inner`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <div className="font-semibold text-lg text-white">{title}</div>
          <div className="mt-1 text-sm text-white/85">{description}</div>
        </div>
      </div>
    </MotionDiv>
  );
}
