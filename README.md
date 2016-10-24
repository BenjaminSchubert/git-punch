# git-punch

A repo for a lab in the TWEB course at HEIG-VD. The goal is to learn how to use heroku, github pages and Angular by creating a webapp hosted on heroku and a landing page linking to it. The webapp should use the GitHub API to fetch some information and display statistics.

An user should be able to :
* Visit the product landing page, transition to the web app and back to the landing page.
* On the webapp, provide a GitHub repo, user or organization and see "some" analysis.
* See a graph (pie chart or other graphical representation).

## About our app
### Features
Our app consists on using all the commits of a given user to display the projects and the languages used the most (in number of commits). A punchard displays when the commits have been made. Global statistics are shown as well, based on the aggregation on the commits of each user having visited the webapp.

### Usage
When the user arrives on the webapp, he can see the global stats. By going on the "my stats" page, he can log in with his github account and see his stats according to the commits he made, in public and private repos alike.

Our landing page can be found [there](https://benjaminschubert.github.io/git-punch/).
