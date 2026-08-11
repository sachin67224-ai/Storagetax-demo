@description('Environment name, e.g. nonprod')
param environment string

@description('Azure region for deployment')
param location string = resourceGroup().location

// Pehle se bani hui VNet ka subnet reference karo
var aksSubnetId = resourceId('Microsoft.Network/virtualNetworks/subnets', 'vnet-storagetax-${environment}', 'snet-aks')

resource aks 'Microsoft.ContainerService/managedClusters@2024-02-01' = {
  name: 'aks-storagetax-${environment}'
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    dnsPrefix: 'storagetax-${environment}'
    agentPoolProfiles: [
      {
        name: 'systempool'
        count: 1
        vmSize: 'Standard_D2ads_v7'
        osType: 'Linux'
        mode: 'System'
        vnetSubnetID: aksSubnetId
      }
    ]
    networkProfile: {
      networkPlugin: 'azure'
    }
  }
}

output aksName string = aks.name
output aksPrincipalId string = aks.identity.principalId
output kubeletIdentityObjectId string = aks.properties.identityProfile.kubeletidentity.objectId
