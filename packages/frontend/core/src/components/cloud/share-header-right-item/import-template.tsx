import { Button } from '@nexio/component';
import { useNavigateHelper } from '@nexio/core/components/hooks/use-navigate-helper';
import { useI18n } from '@nexio/i18n';

export const ImportTemplateButton = ({
  name,
  snapshotUrl,
}: {
  name: string;
  snapshotUrl: string;
}) => {
  const t = useI18n();
  const { jumpToImportTemplate } = useNavigateHelper();
  return (
    <Button
      variant="primary"
      onClick={() => jumpToImportTemplate(name, snapshotUrl)}
    >
      {t['com.nexio.share-page.header.import-template']()}
    </Button>
  );
};
