resource publicIp 'Microsoft.Network/publicIPAddresses@2023-09-01' = {
  name: 'pip-vpngw-${environment}'
  location: location
  sku: {
    name: 'Standard'
  }
  zones: [
    '1'
    '2'
    '3'
  ]
  properties: {
    publicIPAllocationMethod: 'Static'
  }
}
