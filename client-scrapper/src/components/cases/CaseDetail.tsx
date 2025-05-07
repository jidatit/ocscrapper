import { useParams, useNavigate } from 'react-router-dom';
import { useCase } from '@/hooks/useCase';
import { format } from 'date-fns';
import {
  FileText,
  Calendar,
  Users,
  Briefcase,
  Gavel,
  ArrowLeft,
  ExternalLink,
  Loader2,
  RefreshCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function CaseDetail() {
  const { caseNumber } = useParams<{ caseNumber: string }>();
  const { data, isLoading, isError, error, isRefetching, refetch } = useCase(caseNumber || '');
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading case details...</p>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-destructive/10 p-3 rounded-full mb-4">
          <FileText className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Case Not Found</h2>
        <p className="text-muted-foreground mb-6 mx-auto">
          {error?.message || "The case you're looking for couldn't be found or you don't have permission to view it."}
        </p>
        <Button onClick={() => navigate('/cases')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cases
        </Button>
      </div>
    );
  }

  const caseData = data?.data || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <Button
            variant="ghost"
            className="mb-2 -ml-3 text-muted-foreground"
            onClick={() => navigate('/cases')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to all cases
          </Button>
          <h1 className="text-3xl font-bold">Case {caseData.caseNumber || 'N/A'}</h1>
          <div className="flex items-center mt-1">
            <Badge variant="outline" className="mr-2">
              {caseData.caseType || 'Unknown'}
            </Badge>
            <span className="text-sm text-muted-foreground flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              Filed on {caseData.dateFiled ? format(new Date(caseData.dateFiled), 'MMMM d, yyyy') : 'Date not available'}
            </span>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isRefetching}
              className='ml-4'
            >
              <RefreshCcw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>

        </div>

        {caseData.pdfUrl && (
          <Button
            variant="outline"
            className="flex items-center"
            onClick={() => window.open(caseData.pdfUrl, '_blank')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Open PDF
            <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Parties Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Case Parties
            </CardTitle>
            <CardDescription>Plaintiffs and defendants in this case</CardDescription>
          </CardHeader>

          {/* Global address status */}
          {caseData.addressError ? (
            <div className="px-4 py-2 bg-red-100 text-red-800 text-sm">
              Error loading addresses: {caseData.addressError}
            </div>
          ) : !caseData.addressesArrived ? (
            <div className="px-4 py-2 bg-yellow-100 text-yellow-800 text-sm">
              Addresses are still loading...
            </div>
          ) : null}

          <CardContent>
            <div className="space-y-4">
              {/* Plaintiffs */}
              <div>
                <h3 className="font-medium mb-2">Plaintiffs</h3>
                {caseData.plaintiffs?.length ? (
                  <ul className="list-none space-y-4 pl-2">
                    {caseData.plaintiffs.map(
                      ({ _id, name, attorney, attorneyPhone, address }) => (
                        <li key={_id || name} className="text-sm space-y-1">
                          <div>
                            <strong>{name || 'Name not provided'}</strong>
                          </div>
                          <div>Attorney: {attorney || 'Not specified'}</div>
                          <div>Phone: {attorneyPhone || 'Not specified'}</div>
                          <div>
                            Address:{' '}
                            {address
                              ? address.split('\n').map((line, i) => (
                                <div key={i}>{line}</div>
                              ))
                              : 'Not provided'}
                          </div>
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No plaintiff information available
                  </p>
                )}
              </div>

              <Separator />

              {/* Defendants */}
              <div>
                <h3 className="font-medium mb-2">Defendants</h3>
                {caseData.defendants?.length ? (
                  <ul className="list-none space-y-4 pl-2">
                    {caseData.defendants.map(
                      ({ _id, name, attorney, attorneyPhone, address }) => (
                        <li key={_id || name} className="text-sm space-y-1">
                          <div>
                            <strong>{name || 'Name not provided'}</strong>
                          </div>
                          <div>Attorney: {attorney || 'Not specified'}</div>
                          <div>Phone: {attorneyPhone || 'Not specified'}</div>
                          <div>
                            Address:{' '}
                            {address
                              ? address.split('\n').map((line, i) => (
                                <div key={i}>{line}</div>
                              ))
                              : 'Not provided'}
                          </div>
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No defendant information available
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Case Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              Case Information
            </CardTitle>
            <CardDescription>Details about this legal case</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <h3 className="text-sm font-medium">Case Number</h3>
                <p>{caseData.caseNumber || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Case Type</h3>
                <p>{caseData.caseType || 'Unknown'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Date Filed</h3>
                <p>{caseData.dateFiled ? format(new Date(caseData.dateFiled), 'MMMM d, yyyy') : 'N/A'}</p>
              </div>
            </div>

            {/* Judgment Details Array */}
            {caseData.judgmentDetails?.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium mb-2 flex items-center">
                    <Gavel className="h-4 w-4 mr-2" />
                    Judgment Details
                  </h3>
                  <ul className="space-y-4">
                    {caseData.judgmentDetails.map(({ name, date }, idx) => (
                      <li key={idx} className="grid grid-cols-2 gap-2">
                        <div>
                          <h4 className="text-sm font-medium">Document</h4>
                          <p className="text-sm whitespace-pre-line">{name || 'N/A'}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Date</h4>
                          <p className="text-sm">{date ? format(new Date(date), 'MMMM d, yyyy') : 'N/A'}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* Additional Data */}
            {caseData.additionalData && Object.keys(caseData.additionalData).length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium mb-2">Additional Information</h3>
                  <div className="space-y-2">
                    {Object.entries(caseData.additionalData).map(([key, value]) => (
                      <div key={key}>
                        <h4 className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                        <p className="text-sm">{value?.toString() || 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}