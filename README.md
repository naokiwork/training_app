# training_app
making fitness app

## MVP Status
- MVP complete for core flow:
  - log creation and review
  - exercise guide list/detail
  - plan list/detail
  - dashboard contribution heatmap

## Local-First Phase Notes
- Workout logs are stored locally in IndexedDB (device-local only).
- In this phase, cross-device sync is intentionally out of scope.
- Clearing browser storage can remove local workout data.
- Premium limits in local-first mode are UI-level controls; strict anti-tamper is out of scope.
gh auth status
gh repo create


git checkout -b feature/xxx



git switch main

cd ~/Git-Hub_repository/training_app

４、まとめてコミット 
git add .
 git commit -m "Update 変更内容"

5,git-hubにプッシュ git push -u origin feature/multiple-changes

6,PRを作る gh pr create --title "Update README and sort scripts" --body "READMEと手作業ソートシミュレーションのコードを更新しました。レビューお願いします。"


cd ~/Git-Hub_repository/training_app
git add .
git commit -m "Update 変更内容"
git push -u origin feature/multiple-changes
gh pr create --title "Update README and sort scripts" --body "READMEと手作業ソートシミュレーションのコードを更新しました。レビューお願いします。"