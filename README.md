# git-punch

A repo for a lab in the TWEB course at HEIG-VD. The goal is to learn how to use heroku, github pages and Angular by creating a webapp hosted on heroku and a landing page linking to it. The webapp should use the GitHub API to fetch some information and display statistics.

An user should be able to :
* Visit the product landing page, transition to the web app and back to the landing page.
* On the webapp, provide a GitHub repo, user or organization and see "some" analysis.
* See a graph (pie chart or other graphical representation).

## About our app
The landing page can be found [there](https://benjaminschubert.github.io/git-punch/).

### Features
Our app consists on using all the commits of a given user to display when he made them (using a punchcard), and in which projects and languages he contributed the most. Global statistics can be displayed as well, based on the aggregation on the commits of each user having visited the webapp.

### Usage
When you arrive on the webapp, you can see the global stats (home page). By going on the "my stats" page, you can log in with your github account and see your stats according to the commits you made, in public and private repos alike.

Note: when logging in with your GitHub account, you'll see the app asks for read/write access on your repos. It is needed in order to access to your private repos and commits info.

### About the authors
Made by Benjamin Schubert & Basile Vu in the TWEB course at HEIG-VD (Team O).
