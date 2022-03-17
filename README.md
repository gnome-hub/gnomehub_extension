# About the Project
<p align="center">
  <img src="https://i.ibb.co/fMpvtxv/logo.png">
</p>

[GnomeHub](https://gnome-hub.github.io/) is a Gnome Desktop Extension compatible across all Linux Distros running Gnome [Desktop](https://bit.ly/3i9veTL). It allows you to have your notifications organised by app, along with customisable widgets and system stats available in a single location! No more worries about a slower gnome desktop or a cloggy extension bar. The GnomeHub is a constantly evolving, one stop solution to all your desktop needs. Visit our [Website](https://gnome-hub.github.io/) to know more!

Want to join the project? Interested in making a contribution to this project? 

JOIN OUR [DISCORD](https://discord.gg/9cHcHyf5e6) to become a part of our community
# Table of Contents
1. Features
2. Setup Instructions
  a. Installation from Gnome Extensions store
  b. Installation through GitHub
4. Gallery
5. Making a Contribution
  a. Reporting a new issue / feature
  b. Addressing a current issue / pull request


# Features
- Notification Tabs
  * arranged by app to prevent clutter with each app having its notificationds as a subsection of itself
  * Only the top 10 can be displayed in order to prevent gnome desktop from slowing your entire system down!
- Modular and customisable widgets
  * inbuild widgets for daily use items like weather, system usage information, quick copy clipboard with more on there way!
  * Feel free to provide us with ideas for other widgets we can add.
- System Statistics
  * Custom statistics for your system including CPU usage & Memory usage 

# Setup Instructions
## Method 1 - Download directly from the Gnome Extension Store
This extension is still a work in progress and we plan to have our first prototype out on the store within a month!

## Method 2 - Cloning from Github
> Step 1 - Setting up your terminal:
> 
> 1. Open Terminal on your linux desktop
> 2. Run `sudo apt get update`
> 3. Run `sudo apt get upgrade`
> 4. Make sure you have git installed on your local terminal, if not, instructions are available [here](https://github.com/git-guides/install-git#:~:text=%20If%20you%20already%20have%20Homwbrew%20installed%2C%20you,the%20installation%20by%20typing%3A%20git%20version.%20More%20)
> 5. Once complete, move onto Step 2

> Step 2 - Installing Git Repository
> 
> 1. Go to [`https://github.com/gnome-hub/gnomehub_extension/`](https://github.com/gnome-hub/gnomehub_extension/) on your browser
> 2. Click on the `Code` button and copy the link under the `HTTP` tab
> <img src="https://60devs.com/img/guide-getting-started-with-github/clone.png">
> 
> 3. Open Terminal on your desktop and run `git clone **place copied link here**`
> 4. Once complete, move to Step 3

> Step 3 - Installing the extension
> 1. Once the git command runs successfully, `cd` into the Git Directory
> 2. Run `./install.sh` to install the extension. This will make your desktop restart and temporarily will freeze everything but should not take more than 10-15 seconds.
> 3. You're all set! 


# Gallery 
<p align="center">
  <img src="https://gnome-hub.github.io/img/update_march3-1.png">
</p>
More images can be found [HERE](https://gnome-hub.github.io/gallery.html)

# Make a contribution
## Case 1 - Creating a new issue / feature request
> Step 1 - Opening an Issue
> 
> 1. Go to the [Issues](https://github.com/gnome-hub/gnomehub_extension/issues) tab in this repository
> 2. Click on `New Issue`
> 3. Select if you want to `Report a Bug` or `Request a Feature`
> 4. Click the `Get Started` button for whichever one you want to work on
> 5. Once complete, move onto Step 2

> Step 2 - Filling out details and submitting the issue
> 
> 1. Answer all the questions on the template to the best of your ability - adding a title is `REQUIRED`
> 2. Once complete, click on the `Submit New Issue` button
> 3. Thank you for the contribution, someone from the community will address the issue soon!

## Case 2 - Addressing a current issue / feature request
> Step 1 - Picking an issue
> 
> 1. Go to the [Issues](https://github.com/gnome-hub/gnomehub_extension/issues) tab in this repository
> 2. Select which issue you want to work on. Each issue comes with a tag. Eg: `Bug`
> 3. Once open, look into details of the bug to make sure it is something you would like to work on
> 4. Assign the issues to yourself by adding yourself under the `Assignees` section
> 5. Once complete, move to step 2

> Step 2 - Setting up repository
> 
> 1. Go to the [homepage](https://github.com/gnome-hub/gnomehub_extension/) of the repository
> 2. Click on the `Code` button
> 3. Copy the link to your clipboard
> 4. Go to your LINUX COMPUTER terminal and into the directory you want to work on the extension from
> 5. Type `git clone **URL**`
> NOTE: this step will only work if you have Git installed on your command line
> 6. Once complete, move to Step 3 

> Step 3 - Fixing Bug and creating a pull request
> 
> 1. Before you work on the code, create a new branch to work on
> 2. Work on the code on the new branch and fix the issue
> 2. Once complete, Push the changes onto the branch 
> 4. Create a `pull request` and add a comment stating what you did to fix the issue
> 5. One of the reviewers will review your code and merge it with the main branch
> 
> Thank you for your contribution!


