import { notification } from "antd";


export const handleExport = (submittedValues?: any) => {
    if (submittedValues) {
      const json = JSON.stringify(submittedValues, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'fleets_config.json';
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } else {
      notification.error({
        message: 'No form data submitted',
        description: 'Please submit the form data before exporting.',
      });
    }
  };