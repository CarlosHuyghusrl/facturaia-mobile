# Estado rápido

```bash
echo "Branch: $(git branch --show-current)"
echo "Last commit: $(git log --oneline -1)"
echo "Dirty: $(git status --porcelain | wc -l)"
echo "Unpushed: $(git log origin/main..HEAD --oneline 2>/dev/null | wc -l)"
```
