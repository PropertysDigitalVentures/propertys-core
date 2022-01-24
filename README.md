# Propertys NFT

## Launch Checklist

### **Pre-Deployment**

🔳⬜

- 🔳 Pinata Account Setup
  - Account Email = `konrad@propertys-nft.com`
- ⬜ Estimate Deployment Cost
  - Estimated Cost = `INSERT ESTIMATE HERE`
- ⬜ Transfer ETH to Developer Wallet `0x4Bd74c39c35bB05Ca51B752EAe073072f0a8a355` @
- 🔳 Transfer 2 LINK to Developer Wallet
- ⬜ Set all contract variables (see below)
- ⬜ Metadata Name
  - See Opensea for example (https://testnets.opensea.io/assets/0x0ab6973d8a2b9a44317485128940f10713ec7be6/50397753)
- ⬜ Metadata Description
  - See Opensea for example (https://testnets.opensea.io/assets/0x0ab6973d8a2b9a44317485128940f10713ec7be6/50397753)
- ⬜ Mint Functions Work on Frontend
  - ⬜ Private Sale
  - ⬜ Partner Sale
  - ⬜ Public Sale

### **Treasury**

- 🔳 Gnosis Safe Created (Mainnet)
  - Gnosis Safe Address = `0x75dd8773c3dBc4E3346838FFFd526043E07f59BD`
- 🔳 Gnosis Safe Signers Set (2/3 signers)

### **Whitelist**

- ⬜ Whitelist Collected for Private Mints
- ⬜ Whitelist Collected for Partner Mints
- ⬜ Whitelist Price Determined

### **Metadata**

- 🔳 Upload all images to IPFS
- 🔳 Upload all metadata files to IPFS
  - Metadata Folder Hash = `QmUWLVcDJ3vbh6swL5CX9QsHuPex2QgfCCCWgsNuLPE4mD`
  - Metadata URI = `https://propertys-nft.mypinata.cloud/ipfs/QmUWLVcDJ3vbh6swL5CX9QsHuPex2QgfCCCWgsNuLPE4mD/`
- 🔳 Upload Pre-reveal Metadata to IPFS
  - Pre-reveal metadata URI = `https://propertys-nft.mypinata.cloud/ipfs/QmeMmfZgXe674rqx7DwkazbDBvPmM5Mn4BmDn2xae1vEVN`

### **Deployment**

- ⬜ Deploy PropertysNFT on Mainnet
  - Contract Address = `INSERT CONTRACT ADDRESS HERE`
- ⬜ Update ABI for frontend
- ⬜ Set Available Mints
- ⬜ Send 2 LINK to PropertysNFT from developer wallet
- ⬜ Initialize Randomness

--- PRESALE STARTS ---

--- PUBLIC SALE STARTS ---

### **Post-Deployment**

- ⬜ Reveal - Update Base URI `npm run update-baseURI-mainnet`
- ⬜ Split Profit Sharing from Treasury
- ⬜ Reserve NFTs??

### Variables

```txt
TREASURY = 0x75dd8773c3dBc4E3346838FFFd526043E07f59BD
COLLECTION_OWNER = 0xC72fb98100997E2847340c9d6770d3aF5557dedd
MAX_SUPPLY = 6000
LAUNCH_PRICE = 0.09 ether
PARTNER_SALE_PRICE = 0.08 ether
PROPERTYS_AGENT_PRICE = 0.08 ether
SENIOR_BROKER_PRICE = 0.0725 ether
EXECUTIVE_REALTOR_PRICE = 0.065 ether
MAX_QUANTITY = 8
WALLET_PUBLIC_LIMIT = 16
PRESALE_WINDOW = 48 hours
PRE_SALE_START = 1639094400
PUBLIC_SALE_START = 1639267200
```
