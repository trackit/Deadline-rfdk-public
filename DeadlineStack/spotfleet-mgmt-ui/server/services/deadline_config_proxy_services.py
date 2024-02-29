import shutil


class DeadlineConfigProxyService:

    def create_backup(self, original_path: str, output_path: str):
        try:
            shutil.copy(original_path, output_path)
            return True
        except Exception as e:
            return False
