import { orm } from '@/util/orm';
import { User } from '@/entities/user.entity';
import { Wallet } from '@/entities/wallet.entity';
import { Currency } from '@/entities/currency.entity';
import { Asset } from '@/entities/asset.entity';
import { Transaction } from '@/entities/transaction.entity';
import { CurrencyType } from '@/enum/currency_type';
import { TransactionDirection, TransactionStatus } from '@/enum/transaction';
import bcrypt from 'bcrypt';

async function seed() {
  const db = (await orm).em.fork();

  try {
    // Check and create currencies
    let usd = await db.findOne(Currency, { symbol: 'USD' });
    if (!usd) {
      usd = new Currency();
      usd.symbol = 'USD';
      usd.name = 'US Dollar';
      usd.precision = 2;
      usd.type = CurrencyType.Fiat;
      await db.persist(usd).flush();
      console.log('✅ USD currency created');
    } else {
      console.log('ℹ️  USD currency already exists');
    }

    let btc = await db.findOne(Currency, { symbol: 'BTC' });
    if (!btc) {
      btc = new Currency();
      btc.symbol = 'BTC';
      btc.name = 'Bitcoin';
      btc.precision = 8;
      btc.type = CurrencyType.Crypto;
      await db.persist(btc).flush();
      console.log('✅ BTC currency created');
    } else {
      console.log('ℹ️  BTC currency already exists');
    }

    let eth = await db.findOne(Currency, { symbol: 'ETH' });
    if (!eth) {
      eth = new Currency();
      eth.symbol = 'ETH';
      eth.name = 'Ethereum';
      eth.precision = 8;
      eth.type = CurrencyType.Crypto;
      await db.persist(eth).flush();
      console.log('✅ ETH currency created');
    } else {
      console.log('ℹ️  ETH currency already exists');
    }

    // Check and create test user
    let user = await db.findOne(User, { username: 'testuser' });
    let wallet: Wallet;

    if (!user) {
      user = new User();
      user.fullName = 'Test User';
      user.username = 'testuser';
      user.email = 'test@virtuex.com';
      user.password = await bcrypt.hash('password123', 10);
      user.activated = true;

      wallet = new Wallet();
      user.wallet = wallet;

      await db.persist([wallet, user]).flush();
      console.log('✅ User and Wallet created');
    } else {
      console.log('ℹ️  Test user already exists');
      wallet = user.wallet;
      await db.populate(user, ['wallet']);
    }

    // Check and create assets
    let assetUSD = await db.findOne(Asset, { wallet, currency: usd });
    if (!assetUSD) {
      assetUSD = new Asset();
      assetUSD.wallet = wallet;
      assetUSD.currency = usd;
      assetUSD.amount = BigInt(100000);
      await db.persist(assetUSD).flush();
      console.log('✅ USD asset created');
    } else {
      console.log('ℹ️  USD asset already exists');
    }

    let assetBTC = await db.findOne(Asset, { wallet, currency: btc });
    if (!assetBTC) {
      assetBTC = new Asset();
      assetBTC.wallet = wallet;
      assetBTC.currency = btc;
      assetBTC.amount = BigInt(50000000);
      await db.persist(assetBTC).flush();
      console.log('✅ BTC asset created');
    } else {
      console.log('ℹ️  BTC asset already exists');
    }

    let assetETH = await db.findOne(Asset, { wallet, currency: eth });
    if (!assetETH) {
      assetETH = new Asset();
      assetETH.wallet = wallet;
      assetETH.currency = eth;
      assetETH.amount = BigInt(200000000);
      await db.persist(assetETH).flush();
      console.log('✅ ETH asset created');
    } else {
      console.log('ℹ️  ETH asset already exists');
    }

    // Check transaction count for this wallet
    const existingTxCount = await db.count(Transaction, {
      asset: { wallet }
    });

    if (existingTxCount === 0) {
      const tx1 = new Transaction();
      tx1.asset = assetBTC;
      tx1.amount = BigInt(10000000);
      tx1.direction = TransactionDirection.Incoming;
      tx1.status = TransactionStatus.Completed;

      const tx2 = new Transaction();
      tx2.asset = assetUSD;
      tx2.amount = BigInt(5000);
      tx2.direction = TransactionDirection.Incoming;
      tx2.status = TransactionStatus.Completed;

      const tx3 = new Transaction();
      tx3.asset = assetETH;
      tx3.amount = BigInt(50000000);
      tx3.direction = TransactionDirection.Outgoing;
      tx3.status = TransactionStatus.Completed;

      await db.persist([tx1, tx2, tx3]).flush();
      console.log('✅ Transactions created');
    } else {
      console.log('ℹ️  Transactions already exist');
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log('\nTest user credentials:');
    console.log('Email: test@virtuex.com');
    console.log('Password: password123');
    console.log('\nWallet ID:', wallet.id.toString());
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await (await orm).close();
  }
}

seed();
