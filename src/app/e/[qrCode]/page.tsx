import { notFound } from 'next/navigation';
import { getEmployeeByQrCode } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, AlertTriangle, XCircle, Shield, Award, Wrench } from 'lucide-react';

interface PageProps {
  params: Promise<{ qrCode: string }>;
}

export default async function EmployeeScanPage({ params }: PageProps) {
  const { qrCode } = await params;
  const employee = getEmployeeByQrCode(qrCode);

  if (!employee) {
    notFound();
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'compliant':
        return {
          label: 'COMPLIANT',
          icon: CheckCircle2,
          color: 'bg-green-500',
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      case 'expiring_soon':
        return {
          label: 'EXPIRING SOON',
          icon: AlertTriangle,
          color: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
        };
      case 'non_compliant':
        return {
          label: 'NON-COMPLIANT',
          icon: XCircle,
          color: 'bg-red-500',
          textColor: 'text-red-700',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      default:
        return {
          label: 'UNKNOWN',
          icon: AlertTriangle,
          color: 'bg-gray-500',
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  const getCertStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { icon: CheckCircle2, color: 'text-green-600' };
      case 'expiring_soon':
        return { icon: AlertTriangle, color: 'text-yellow-600' };
      case 'expired':
        return { icon: XCircle, color: 'text-red-600' };
      default:
        return { icon: AlertTriangle, color: 'text-gray-600' };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'certification':
        return Shield;
      case 'license':
        return Award;
      case 'task_training':
        return Wrench;
      default:
        return Shield;
    }
  };

  const statusConfig = getStatusConfig(employee.overallStatus);
  const StatusIcon = statusConfig.icon;

  const certifications = employee.certifications.filter((c) => c.type !== 'task_training');
  const taskTraining = employee.certifications.filter((c) => c.type === 'task_training');

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'No expiry';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntilExpiry = (dateStr: string | null) => {
    if (!dateStr) return null;
    const expiry = new Date(dateStr);
    const today = new Date();
    const days = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={employee.photoUrl} alt={employee.name} />
                <AvatarFallback className="text-xl">
                  {employee.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900">{employee.name}</h1>
                <p className="text-gray-600">{employee.role}</p>
                <p className="text-sm text-gray-500">{employee.company}</p>
              </div>
            </div>

            {/* Status Banner */}
            <div
              className={`mt-4 p-3 rounded-lg flex items-center justify-center gap-2 ${statusConfig.bgColor} ${statusConfig.borderColor} border`}
            >
              <StatusIcon className={`h-6 w-6 ${statusConfig.textColor}`} />
              <span className={`font-bold text-lg ${statusConfig.textColor}`}>
                {statusConfig.label}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Certifications & Licenses */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Certifications & Licenses
            </h2>
            <div className="space-y-3">
              {certifications.map((cert) => {
                const certStatus = getCertStatusConfig(cert.status);
                const CertIcon = certStatus.icon;
                const TypeIcon = getTypeIcon(cert.type);
                const daysUntil = getDaysUntilExpiry(cert.expiryDate);

                return (
                  <div
                    key={cert.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                  >
                    <CertIcon className={`h-5 w-5 mt-0.5 ${certStatus.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{cert.name}</span>
                        <Badge variant="outline" className="text-xs">
                          <TypeIcon className="h-3 w-3 mr-1" />
                          {cert.type === 'license' ? 'License' : 'Cert'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        Expires: {formatDate(cert.expiryDate)}
                      </p>
                      {daysUntil !== null && daysUntil <= 30 && daysUntil > 0 && (
                        <p className="text-sm text-yellow-600 font-medium">
                          ({daysUntil} days remaining)
                        </p>
                      )}
                      {daysUntil !== null && daysUntil < 0 && (
                        <p className="text-sm text-red-600 font-medium">
                          (Expired {Math.abs(daysUntil)} days ago)
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Task Training */}
        {taskTraining.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Task Training
              </h2>
              <div className="flex flex-wrap gap-2">
                {taskTraining.map((training) => (
                  <Badge
                    key={training.id}
                    variant="secondary"
                    className="flex items-center gap-1 py-1.5 px-3"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    {training.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pt-2">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p className="mt-1">Powered by HardHat</p>
        </div>
      </div>
    </div>
  );
}
