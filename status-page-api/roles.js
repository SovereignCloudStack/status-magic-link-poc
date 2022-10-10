/*
  This assigns roles to users. Every user can be part of multiple roles.
  Read it like "bob@foobar-scs.org" owns the "admin" role.
  Also a domain wide matching is possible. Everyone who's mail ends with
  "@some-other-company.abcde" will get the role "userOfSomeOtherCompany".
*/

export default {
  admin: [
    'bob@foobar-scs.org',
  ],
  userOfTheCompany: [
    '@cloudandheat.com',
    '@osb-alliance.com',
    '@gonicus.de'
  ],
  userOfSomeOtherCompany: [
    '@some-other-company.abcde'
  ]
}
