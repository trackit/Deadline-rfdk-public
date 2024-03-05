from ..backup import Backup, BackupException
import pytest
import os


class TestBackup:
    _backup = Backup()
    _original_path = 'original.txt'
    _output_path = 'backup.txt'

    def create_original_file(self):
        with open(self._original_path, "w") as file:
            file.write("Hello world!")

    def delete_files(self):
        if os.path.exists(self._original_path):
            os.remove(self._original_path)
        if os.path.exists(self._output_path):
            os.remove(self._output_path)

    def test_invalid_original_path(self):
        # Test case: Attempt to create a backup with an unknown original path (file does not exist).
        with pytest.raises(BackupException, match="Failed to create backup:"):
            self._backup.create('unknow.txt', self._output_path)

    def test_missing_original_path(self):
        # Test case: Attempt to create a backup with a missing original path.
        with pytest.raises(BackupException, match="Failed to create backup:"):
            assert self._backup.create('', self._output_path) is None

    def test_missing_output_path(self):
        # Test case: Attempt to create a backup with a missing output path.
        with pytest.raises(BackupException, match="Failed to create backup:"):
            self.create_original_file()
            assert self._backup.create(self._original_path, '') is None
            self.delete_files()

    def test_same_path(self):
        # Test case: Attempt to create a backup with the same original and output paths.
        with pytest.raises(BackupException, match="Failed to create backup:"):
            self.create_original_file()
            assert self._backup.create(
                self._original_path, self._original_path) is None
            self.delete_files()

    def test_create_success(self):
        # Test case: Successfully create a backup and verify content equality.
        self.create_original_file()
        result = self._backup.create(self._original_path, self._output_path)

        assert result == self._output_path

        assert os.path.exists("original.txt")
        assert os.path.exists("backup.txt")

        with open("original.txt", "r") as original_file:
            original_content = original_file.read()
        with open("backup.txt", "r") as backup_file:
            backup_content = backup_file.read()
        assert original_content == backup_content

        self.delete_files()
