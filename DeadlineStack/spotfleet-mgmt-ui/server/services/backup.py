import shutil


class Backup:

    def create(self, original_path: str, output_path: str):
        try:
            shutil.copy(original_path, output_path)
            return output_path
        except Exception as e:
            return False
