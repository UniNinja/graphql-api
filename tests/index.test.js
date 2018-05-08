import fetch from 'node-fetch'

const endpoint = 'http://localhost:3000/v1'

const getQuery = (query) => ({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Basic NDMwZDgyMmYtMDBlNS00MDY1LWE4MTctZDlmZjBjNWZkYTRjOnBhc3N3b3Jk"
    },
    body: JSON.stringify({ query: query })
})

describe('Query universities', function() {

  it('list length', () => {
    fetch(endpoint, getQuery(`{
  universities {
    name
    pubukprn
  }
}`)).then(res => res.json()).then(json => {
      expect(json.data.universities.length).toBe(152)
    }).catch(err => {
      throw new Error(err)
    })

  });

  it('every uni has a name', () => {
    fetch(endpoint, getQuery(`{
  universities {
    name
  }
}`)).then(res => res.json()).then(json => {
      for(let i = 0; i < json.length; i++) {
        expect(json[i].name !== null)
      }
    }).catch(err => {
      throw new Error(err)
    })

  });
});
