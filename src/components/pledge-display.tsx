"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sprout } from 'lucide-react';

interface PledgeDisplayProps {
  pledges: string[];
}

export function PledgeDisplay({ pledges }: PledgeDisplayProps) {
  if (pledges.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl px-4 mx-auto">
      <Card className="shadow-lg bg-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-headline text-foreground">
            <Sprout className="w-6 h-6 text-primary" />
            Your Pledges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {pledges.map((pledge, index) => (
              <li key={index} className="font-body text-muted-foreground">
                - {pledge}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
