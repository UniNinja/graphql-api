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

function getUniversityList() {
  return fetch(endpoint, getQuery(`{
  universities {
    name
    pubukprn
  }
}`))
  .then(res => res.json())
}

function getSussexUni () {
  return fetch(endpoint, getQuery(`{
  university (pubukprn: "10007806") {
    name
    pubukprn
    courses {
      title
    }
  }
}`))
  .then(res => res.json())
}

describe('Query universities', () => {

  it('list length', () => {
    expect.assertions(1)
    return getUniversityList().then(json => {
      expect(json.data.universities.length).toEqual(152)
    }).catch(err => {
      console.log('list length error', err)
    })
  });

  it('to check name of sussex uni', () => {
    expect.assertions(1)
    return getSussexUni().then(json => {
      expect(json.data.university.name).toEqual("University Of Sussex")
    })
  });

  it('returns the correct number of courses for sussex', () => {
    expect.assertions(1)
    return getSussexUni().then(json => {
      expect(json.data.university.courses.length).toEqual(209)
    })
  })

 });
