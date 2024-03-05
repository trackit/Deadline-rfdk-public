import shutil


class BackupException(Exception):
    pass


class Backup:

    def create(self, original_path: str, output_path: str):
        try:
            shutil.copy(original_path, output_path)
            return output_path
        except Exception as e:
            raise BackupException(f"Failed to create backup: {str(e)}")
