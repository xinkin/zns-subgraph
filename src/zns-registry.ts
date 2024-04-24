import { MintedDomain as MintedDomainEvent, PrimaryDomainSet as PrimaryDomainSetEvent, RenewedDomain as RenewedDomainEvent, Transfer as TransferEvent } from "../generated/ZNSRegistry/ZNSRegistry"
import { Domain, Owner, Transfer, Mint } from "../generated/schema"

export function handleMintedDomain(event: MintedDomainEvent): void {
  let domain = new Domain(event.params.tokenId.toString())
  domain.name = event.params.domainName
  domain.createdAt = event.block.timestamp
  domain.expiryDate = event.params.expiry
  let ownerId = event.params.owner.toHex()
  let owner = Owner.load(ownerId)
  if (!owner) {
    owner = new Owner(ownerId)
  }
  owner.save()
  domain.owner = owner.id
  domain.save()
  let mintedEvent = new Mint(event.params.tokenId.toString())
  mintedEvent.domain = domain.id
  mintedEvent.blockNumber = event.block.number
  mintedEvent.transactionHash = event.transaction.hash
  mintedEvent.save()
}

export function handlePrimaryDomainSet(event: PrimaryDomainSetEvent): void {
  let domain = Domain.load(event.params.tokenId.toString())
  if (!domain) {
    return
  }
  let ownerId = event.params.owner.toHex()
  let owner = Owner.load(ownerId)
  if (!owner) {
    owner = new Owner(ownerId)
  }
  domain.owner = owner.id
  domain.save()
  owner.save()
}

export function handleRenewedDomain(event: RenewedDomainEvent): void {
  let domain = Domain.load(event.params.tokenId.toString())
  if (!domain) {
    return
  }
  domain.expiryDate = event.params.expiry
  domain.save()
}

export function handleTransfer(event: TransferEvent): void {
  let domain = Domain.load(event.params.tokenId.toHex())
  if (!domain) {
    return
  }
  let transfer = new Transfer(event.transaction.hash.toHex())
  transfer.domain = domain.id
  transfer.from = event.params.from.toHex()
  transfer.to = event.params.to.toHex()
  transfer.blockNumber = event.block.number
  transfer.transactionHash = event.transaction.hash
  let toOwnerId = event.params.to.toHex()
  let toOwner = Owner.load(toOwnerId)
  if (!toOwner) {
    toOwner = new Owner(toOwnerId)
  }
  domain.owner = toOwner.id
  transfer.save()
  domain.save()
  toOwner.save()
}