import assert from "assert";
import { TransferLog } from "../types/abi-interfaces/Erc721Abi";
import { getAccount, getCollection, getNft, updateFloorPrice } from "./utils";
import { Marketplace, Network } from "../types";
import { Collection, Nft, NftTransfers, Price } from "../types/models";
import {
  TokenListedLog,
  TokenPurchasedLog,
} from "../types/abi-interfaces/MoonbeansAbi";

export async function handleMoonriverTransfer(log: TransferLog): Promise<void> {
  if (log.topics.length !== 4) return;
  logger.info(`New Nft transfer transaction log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  let collection = await getCollection(log.address, Network.MOONRIVER);
  let nft = await getNft(collection.network, log);

  if (nft) {
    let from = await getAccount(log.args.from);
    let to = await getAccount(log.args.to);

    const id = [log.blockNumber.toString(), log.logIndex.toString()].join("-");
    let event = NftTransfers.create({
      id,
      network: nft.network,
      nftId: nft.id,
      block: BigInt(log.blockNumber),
      timestamp: parseInt(log.block.timestamp.toString()),
      transactionId: log.transactionHash,
      fromId: from.id,
      toId: to.id,
    });

    await event.save();
  }
}

export async function handleMoonriverMoonbeansListing(log: TokenListedLog) {
  logger.info(`New Nft listing transaction log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  const nftId = [
    Network.MOONRIVER,
    log.args.token,
    log.args.id.toString(),
  ].join("-");
  let nft = await Nft.get(nftId);
  let price = await Price.get(nftId);

  if (!price) {
    price = Price.create({
      id: nftId,
      amount: log.args.price.toBigInt(),
      marketplace: Marketplace.MOONBEANS,
    });

    await price.save();
  }

  if (nft) {
    nft.priceId = price.id;
    await nft.save();
  }
}

export async function handleMoonriverMoonbeansSale(log: TokenPurchasedLog) {
  logger.info(`New Nft sale transaction log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  const id = [Network.MOONRIVER, log.args.collection].join("-");
  const amount = log.args.price.toString();

  await updateFloorPrice(id, amount);
}
