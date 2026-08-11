@description('Environment name, e.g. nonprod')
param environment string

// AKS ki kubelet identity (jo containers use karte hain) — aks module se output li thi
@description('Principal ID of the AKS kubelet identity')
param aksKubeletIdentityObjectId string

// Azure ka built-in "Key Vault Secrets User" role ID (secrets padhne ke liye, likhne ke liye nahi)
var keyVaultSecretsUserRoleId = '4633458b-17de-408a-b874-0445c86b69e6'

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: 'kv-storagetax-${environment}'
}

resource roleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, aksKubeletIdentityObjectId, keyVaultSecretsUserRoleId)
  scope: keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', keyVaultSecretsUserRoleId)
    principalId: aksKubeletIdentityObjectId
    principalType: 'ServicePrincipal'
  }
}
