import fetch from 'node-fetch';

class TokenManagment {

    access_token: string;
    refresh_token: string;
    refreshPromise: Promise<string> | null;


    async get_token() {
        
        if (this.refreshPromise != null) {
            // if there is a refresh process already in-flight, return its results when finished
            return await this.refreshPromise
        } else if (this.access_token) {
            // if there is no refresh process in-flight, and we have a token, return it
            return this.access_token
        }   else {
            // else, this is the first time we are calling the API, so we need to get a token
            const result = await fetch('https://www.example.com/.auth/me')
            const result_json : any = await result.json()
            this.access_token = result_json.access_token
            this.refresh_token = result_json.refresh_token
            return this.access_token
        }
    }

    async refresh() {

        if (this.refreshPromise != null) {
            // if there is a refresh process already in-flight, return its results when finished
            return await this.refreshPromise
        } else {
            // create a new refresh process
            this.refreshPromise = new Promise( async (resolve, reject) => {
                const result = await fetch('https://www.example.com/.auth/refresh')
                const result_json : any = await result.json()
                this.access_token = result_json.access_token
                this.refresh_token = result_json.refresh_token
                this.refreshPromise = null
                return resolve(this.access_token)
            })
        }
    }

    async call(url: string, headers: any, retry : boolean = true) {
        
    
        const result = await fetch(url, { headers: {...headers, 'Authorization': 'Bearer ' + await this.get_token() }})
        if (result.status == 401 && retry) {
            // need to refresh token
            await this.refresh()
            await this.call(url, headers, false)
        } else {
            throw new Error('Error calling API')
        }
    }
}

// Token management
const token = new TokenManagment()


async function main() {

    console.log ('Hello World!')
    await token.call('https://www.example.com/api/endpoint', { 'Content-Type': 'application/json' })
    await token.call('https://www.example.com/api/endpoint', { 'Content-Type': 'application/json' })
    await token.call('https://www.example.com/api/endpoint', { 'Content-Type': 'application/json' })
    await token.call('https://www.example.com/api/endpoint', { 'Content-Type': 'application/json' })
    await token.call('https://www.example.com/api/endpoint', { 'Content-Type': 'application/json' })
    await token.call('https://www.example.com/api/endpoint', { 'Content-Type': 'application/json' })

}


main()