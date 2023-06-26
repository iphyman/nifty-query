import assert from "assert";
import { TransferLog } from "../types/abi-interfaces/Erc721Abi";
import { getAccount, getCollection, getNft } from "./utils";
import { Marketplace, Network } from "../types";
import { Collection, Nft, NftTransfers, Price } from "../types/models";
import {
  TokenListedLog,
  TokenPurchasedLog,
} from "../types/abi-interfaces/MoonbeansAbi";
import { RunTransaction } from "../types/abi-interfaces/TofuNftAbi";

export async function handleMoonbeamTransfer(log: TransferLog): Promise<void> {
  logger.info(`New Nft transfer transaction log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  let collection = await getCollection(log.address, Network.MOONBEAM);
  let nft = await getNft(collection.network, log);
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

export async function handleMoonbeamMoonbeansListing(log: TokenListedLog) {
  logger.info(`New Nft listing transaction log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  const nftId = [Network.MOONBEAM, log.args.token, log.args.id.toString()].join(
    "-"
  );
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

export async function handleMoonbeamMoonbeansSale(log: TokenPurchasedLog) {
  logger.info(`New Nft sale transaction log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  const id = [Network.MOONBEAM, log.args.collection].join("-");
  const collection = await Collection.get(id);
  const amount = log.args.price.toNumber();

  if (collection && collection.floorPrice < amount) {
    collection.floorPrice = BigInt(amount);
    await collection.save();
  }
}

export async function handleMoonbeamTofuSale(tx: RunTransaction) {
  logger.info(`New Nft sale transaction log at block ${tx.blockNumber}`);
  assert(tx.args, "No log.args");

  const TOKEN_721 = 1;

  const bundle = tx.args[0].bundle;
  //   const currency = tx.args[1].currency;
  const opcode = parseInt(tx.args[1].opcode.toString());

  for (let i = 0; i < bundle.length; i++) {
    const inventory = bundle[i];

    const token = await inventory.token;
    const amount = BigInt((await inventory.amount).toString());
    // const tokenId = await inventory.tokenId;
    const kind = await inventory.kind;

    if (kind == TOKEN_721 && [1, 2, 4, 8, 9].includes(opcode)) {
      const id = [Network.MOONBEAM, token].join("-");
      let collection = await Collection.get(id);

      if (collection && collection.floorPrice < amount) {
        collection.floorPrice = amount;
        await collection.save();
      }
    }
  }
}
