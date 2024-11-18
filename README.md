# Twitter RSS

**Twitter RSS** is a tool for generating RSS feeds based on Twitter search results. It supports custom search queries to provide real-time updates in a standardized feed format. The project is developed in TypeScript, with Docker support for containerized deployment.

## Features
- Generate RSS feeds from Twitter searches.
- Supports keyword-based and advanced query searches.
- Provides Docker configuration for simplified deployment.

## Getting Started
* Clone the repository.
* Configure your Twitter username and password in the environment variables.

```
export TWITTER_USERNAME=<your twitter account>
export TWITTER_PASSWORD=<your twitter password>
```
Notes: this application does not support SSO authentication and will not support it in the future (due to technical issues).

* update accounts in `data/searches.json`

* Install dependencies using `yarn install`.

* Build the TypeScript files using `yarn build`.

The tool will use your twitter (x.com) account to login from your default browner, and get recent posts from the target accounts you set in `data/searches.json` and save the result to local folder `output`

* view the result locally with browser, such as `open output/index.html`

### Use Docker to build and deploy the service.

TBD

## License
MIT License.  
