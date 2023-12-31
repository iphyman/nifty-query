import assert from "assert";
import { TransferLog } from "../types/abi-interfaces/Erc721Abi";
import { getAccount, getCollection, getNft, updateFloorPrice } from "./utils";
import { Network } from "../types";
import { Collection, NftTransfers } from "../types/models";
import { RunTransaction } from "../types/abi-interfaces/TofuNftAbi";

export async function handleShidenTransfer(log: TransferLog): Promise<void> {
  logger.info(`New Nft transfer transaction log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  let collection = await getCollection(log.address, Network.SHIDEN);

  if (collection) {
    let nft = await getNft(collection.network, log);

    if (nft) {
      let from = await getAccount(log.args.from);
      let to = await getAccount(log.args.to);

      const id = [log.blockNumber.toString(), log.logIndex.toString()].join(
        "-"
      );
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
}

export async function handleShidenTofuSale(tx: RunTransaction) {
  logger.info(`New Nft sale transaction log at block ${tx.blockNumber}`);
  assert(tx.args, "No log.args");

  const TOKEN_721 = 1;

  const bundle = tx.args[0].bundle;
  //   const currency = tx.args[1].currency;
  const opcode = parseInt(tx.args[1].opcode.toString());

  for (let i = 0; i < bundle.length; i++) {
    const inventory = bundle[i];

    const token = await inventory.token;
    const amount = (await inventory.amount).toString();
    // const tokenId = await inventory.tokenId;
    const kind = await inventory.kind;

    if (kind == TOKEN_721 && [1, 2, 4, 8, 9].includes(opcode)) {
      const id = [Network.SHIDEN, token].join("-");
      await updateFloorPrice(id, amount);
    }
  }
}
