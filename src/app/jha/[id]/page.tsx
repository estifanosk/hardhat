'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { jhaForms } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  Shield,
  Users,
  Clock,
} from 'lucide-react';

export default function JHASignoffPage() {
  const params = useParams();
  const id = params.id as string;

  const jha = jhaForms.find((j) => j.id === id);

  const [crewSignoffs, setCrewSignoffs] = useState(
    jha?.crewMembers.map((m) => ({ ...m })) || []
  );
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  if (!jha) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold">JHA Form Not Found</h1>
            <p className="text-gray-500 mt-2">The requested form does not exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSignoff = (memberId: string) => {
    setCrewSignoffs((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? {
              ...m,
              signed: true,
              signedAt: new Date().toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              }),
            }
          : m
      )
    );
    toast.success('Signed successfully!');
    setCurrentUser(null);
  };

  const signedCount = crewSignoffs.filter((m) => m.signed).length;
  const totalCount = crewSignoffs.length;
  const allSigned = signedCount === totalCount;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-semibold">Job Hazard Analysis</span>
            </div>

            <h1 className="text-xl font-bold text-gray-900">{jha.siteName}</h1>

            <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(jha.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {jha.foremanName}
              </div>
            </div>

            {/* Progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Crew Sign-off Progress</span>
                <span className="font-medium">
                  {signedCount}/{totalCount}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${allSigned ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${(signedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>

            {allSigned && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-green-700 font-medium">
                  All crew members have signed
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hazards */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-500" />
              Today&apos;s Hazards & Mitigations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {jha.hazards.map((hazard, index) => (
              <div key={hazard.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Badge
                    variant="outline"
                    className="bg-orange-50 text-orange-700 border-orange-200"
                  >
                    {index + 1}
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{hazard.hazard}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium text-green-700">Mitigation:</span>{' '}
                      {hazard.mitigation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Crew Sign-offs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5" />
              Crew Acknowledgment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-500 mb-3">
              Tap your name to acknowledge you have reviewed today&apos;s hazards and
              mitigations.
            </p>

            {crewSignoffs.map((member) => (
              <div
                key={member.id}
                className={`p-3 rounded-lg border transition-colors ${
                  member.signed
                    ? 'bg-green-50 border-green-200'
                    : currentUser === member.id
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                {member.signed ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-gray-900">{member.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      {member.signedAt}
                    </div>
                  </div>
                ) : currentUser === member.id ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{member.name}</span>, by signing you
                      confirm:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4">
                      <li>• I have reviewed all hazards listed above</li>
                      <li>• I understand the mitigation measures</li>
                      <li>• I will follow safe work practices today</li>
                    </ul>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => handleSignoff(member.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Sign & Acknowledge
                      </Button>
                      <Button variant="outline" onClick={() => setCurrentUser(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setCurrentUser(member.id)}
                    className="w-full text-left flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      <span className="font-medium text-gray-900">{member.name}</span>
                    </div>
                    <span className="text-sm text-blue-600">Tap to sign</span>
                  </button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pt-2 pb-4">
          <p>Powered by HardHat</p>
        </div>
      </div>
    </div>
  );
}
