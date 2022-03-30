const { google } = require("googleapis");

class GoogleAuthentication {
    /**
     * @param {string} clientId 
     * @param {string} clientSecret 
     * @param {string} redirectUri 
     * @param {Array} scopes
     */
    constructor(clientId, clientSecret, redirectUri, scopes) {
        this.googleClient = new google.auth.OAuth2({ clientId, clientSecret, redirectUri });
        this.OAuth2_url = this.googleClient.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: scopes
        });
    }

    getGooglePlusApi(auth) {
        return google.plus({ version: "v1", auth });
    }

    /**
     * 
     * @param {string} code 
     * @returns 
     */
    async getTokens(code) {
        const auth = this.googleClient;
        const { tokens } = await auth.getToken(code);
        auth.setCredentials(tokens);
        return tokens;
    }
}

module.exports.GoogleAuthentication = GoogleAuthentication;