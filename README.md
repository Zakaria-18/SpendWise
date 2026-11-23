
# SpendWise — Personal Finance Dashboard

SpendWise is a responsive personal finance dashboard that helps users record daily expenses, monitor a monthly budget and understand where their money goes.

## Features

- Add, edit and delete transactions.
- Monitor monthly budget and remaining balance.
- View spending by category.
- Search and filter transactions.
- Update monthly budget.
- Export transaction records to CSV.
- Save data using browser localStorage.
- Responsive desktop and mobile interface.
- Input validation and safe text rendering.

## Technologies Used

- HTML5
- CSS3
- JavaScript 
- Browser localStorage
- Git and GitHub
- Netlify

## GitHub Repository Information

Repository: https://github.com/Zakaria-18/SpendWise

Owner: Zakaria-18

Visibility: Public

Branch: main

## Live Netlify Website

Live URL: https://spendwise-9fii.netlify.app/

## Deployment Process Summary

1. Created a public GitHub repository.
2. Uploaded the complete SpendWise project.
3. Connected the GitHub repository to Netlify.
4. Selected the main branch for production deployment.
5. Configured the publish directory as the project root.
6. Deployed the website.
7. Customized the Netlify site name.
8. Tested the live application.

## Continuous Deployment Test

1. Made a visible change to the application.
2. Committed and pushed the changes to GitHub.
3. Opened the Netlify Deploys section.
4. Verified that a new deployment started automatically.
5. Checked the live website to confirm the update.

## Challenges Encountered During Deployment

During the deployment of SpendWise, I encountered several configuration and deployment considerations:

1. **GitHub Repository Integration:** Connecting the GitHub repository to Netlify required selecting the correct repository and production branch. I resolved this by connecting the `Zakaria-18/SpendWise` repository and selecting the `main` branch.

2. **Build Configuration:** Since SpendWise was developed using HTML, CSS and JavaScript without a frontend build framework, a build command was unnecessary. I used Netlify's Plain HTML configuration and left the build command empty.

3. **Publish Directory Configuration:** Netlify needed to know where the website files were located. I configured the project root (`.`) as the publish directory so that `index.html`, `style.css` and `script.js` could be served correctly.

4. **Website Address Configuration:** I needed a meaningful website address for the project. I used Netlify's domain management settings to configure the project subdomain.

5. **Deployment Verification:** After deployment, I checked that the dashboard sections, navigation, transaction interface and budget components appeared on the live website.

These deployment considerations helped me understand how GitHub integration, build settings, publish directories and continuous deployment work together when hosting a website on Netlify.

## Lessons Learned

- How to connect a GitHub repository to Netlify.
- How to configure a static website for deployment.
- How to select the correct publish directory.
- How to use GitHub commits to trigger automatic deployments.
- How to verify that a deployed website is accessible and displays its expected content.
- The importance of checking file paths and project structure before deployment.

## Data and Privacy

SpendWise stores transactions locally in the browser. It does not synchronize data between devices or browsers. This is an educational project and should not be used to store sensitive banking information.

## Author

Zakaria-18

GitHub: https://github.com/Zakaria-18
