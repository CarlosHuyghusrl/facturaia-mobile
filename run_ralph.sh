#!/bin/bash
export CLAUDE_ALLOWED_TOOLS='Bash,Edit,Write,Read,Glob,Grep,Task,TodoWrite'
cd ~/eas-builds/FacturaScannerApp
/opt/ralph-claude-code/ralph_loop.sh -v
