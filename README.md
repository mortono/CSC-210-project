Proper Github Practices 
- Don't commit directly to the `master` branch (unless it's something non-functional) 
- Instead, create a new branch for your feature and commit changes to the new branch
- When you are done with your new feature, make a pull request to merge your new branch into `master`
- The code will be reviewed by someone else and then merged into `master` if the reviewer approves

Useful `git` Commands
- `git clone [git repository]`: downloads a git repository from the link into the current directory
- `git status`: Displays what changes have been made and what changes have been made
- `git commit -a -m "[Message here]"` commits the current changes locally (does not push them to the internet)
- `git push origin [branch]`: pushes your changes to the remote branch specified in [branch]
- `git pull`: updates your local code with changes from the remote branch
- `git branch [name]`: creates a branch with [name]
- `git checkout [branchName]`: changes your current branch to [branchName]. Make sure to commit changes before switching branches, this will break things otherwise
- `git add [fileName]`: adds the specified file to the git project
- `git merge [remoteBranch]`:  merges the changes from remote into the current branch

if errors come up, read them and do the most logical thing based on it. (most of the time its something like remerging)
