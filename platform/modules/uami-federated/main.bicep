@description('Environment name, e.g. nonprod')
param environment string

@description('GitHub OIDC subject claim (immutable format with owner and repo IDs)')
param githubSubject string = 'repo:sachin67224-ai@282480834/Storagetax-demo@1329916182:ref:refs/heads/main'

// Reference karo wahi UAMI jo base module ne banayi thi
resource uami 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' existing = {
  name: 'uami-storagetax-${environment}'
}

resource federatedCred 'Microsoft.ManagedIdentity/userAssignedIdentities/federatedIdentityCredentials@2023-01-31' = {
  parent: uami
  name: 'github-oidc-federated'
  properties: {
    issuer: 'https://token.actions.githubusercontent.com'
    subject: githubSubject
    audiences: [
      'api://AzureADTokenExchange'
    ]
  }
}
