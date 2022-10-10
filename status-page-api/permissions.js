/*
  This assigns permissions to roles.

  Read it as:
  Users with the "admin" role, are allowed to "viewComponentStatus"
  for every target matching "* /*". Whatever the target expression
  means. This has to be evaluated by the individual function.
*/

export default {
  everyone: {
    viewComponentStatus: ['public/*']
  },
  admin: {
    viewComponentStatus: ['*/*'],
    updateComponentStatus: ['*/*']
  },
  userOfTheCompany: {
    viewComponentStatus: ['the-company/*']
  },
  userOfSomeOtherCompany: {
    viewComponentStatus: ['some-other-company/*']
  }
}