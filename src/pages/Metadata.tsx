import { Aperture } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { MetadataTable } from '../components/ui/MetadataTable';
import { useExamination } from '../context/ExaminationContext';
import { metadataFieldGroups } from '../utils/exif';

export function Metadata() {
  const { primary } = useExamination();

  if (!primary || primary.status !== 'ready' || !primary.metadata) {
    return (
      <EmptyState
        icon={Aperture}
        title="No metadata analysis yet"
        description="Upload a JPG or HEIC on the Image Examination page and click Analyse Image to extract EXIF fields from the actual file."
        actionLabel="Go to Image Examination"
        actionTo="/examine"
      />
    );
  }

  const groups = metadataFieldGroups(primary.metadata);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="panel p-5">
        <h2 className="section-title">Extracted EXIF Metadata</h2>
        <p className="muted mt-1">
          Values below were parsed from <span className="text-slate-200">{primary.properties.name}</span>{' '}
          using exifr. Unavailable fields are shown as Not Available — TraceLens does not invent
          missing values.
        </p>
        {!primary.metadata.hasExif ? (
          <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            No EXIF block was detected. The image may never have contained EXIF, or metadata may
            have been stripped during export or sharing.
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MetadataTable title="General Information" rows={groups.general} />
        <MetadataTable title="Camera Information" rows={groups.camera} />
        <MetadataTable title="Date and Time" rows={groups.datetime} />
        <MetadataTable title="GPS Information" rows={groups.gps} />
        <div className="lg:col-span-2">
          <MetadataTable title="Software Information" rows={groups.software} />
        </div>
      </div>
    </div>
  );
}
