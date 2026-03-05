import { orm } from '@/util/orm';
import { User } from '@/entities/user.entity';
import { Wallet } from '@/entities/wallet.entity';
import { Currency } from '@/entities/currency.entity';
import { CurrencyHistory } from '@/entities/currency_history.entity';
import { Asset } from '@/entities/asset.entity';
import { Transaction } from '@/entities/transaction.entity';
import { Order } from '@/entities/order.entity';
import { FulfilledOrder } from '@/entities/fulfilled_order.entity';
import { Subscription } from '@/entities/subscription.entity';
import { SubscriptionPlan } from '@/entities/subscription_plan.entity';
import { CurrencyType } from '@/enum/currency_type';
import { TransactionDirection, TransactionStatus } from '@/enum/transaction';
import { OrderStatus, OrderType } from '@/enum/order';
import bcrypt from 'bcrypt';

async function seed() {
  const db = (await orm).em.fork();

  try {
    const getOrCreateCurrency = async (
      symbol: string,
      name: string,
      precision: number,
      type: CurrencyType
    ) => {
      let currency = await db.findOne(Currency, { symbol });
      if (!currency) {
        currency = new Currency();
        currency.symbol = symbol;
        currency.name = name;
        currency.precision = precision;
        currency.type = type;
        db.persist(currency);
        await db.flush();
        console.log(`OK: ${symbol} currency created`);
      } else {
        console.log(`INFO: ${symbol} currency already exists`);
      }

      return currency;
    };

    const usd = await getOrCreateCurrency(
      'USD',
      'US Dollar',
      2,
      CurrencyType.Fiat
    );
    const eur = await getOrCreateCurrency('EUR', 'Euro', 2, CurrencyType.Fiat);
    const btc = await getOrCreateCurrency(
      'BTC',
      'Bitcoin',
      8,
      CurrencyType.Crypto
    );
    const eth = await getOrCreateCurrency(
      'ETH',
      'Ethereum',
      8,
      CurrencyType.Crypto
    );

    // Create subscription plans
    let freePlan = await db.findOne(SubscriptionPlan, { name: 'Free' });
    if (!freePlan) {
      freePlan = new SubscriptionPlan();
      freePlan.name = 'Free';
      freePlan.monthlyAiCredits = 10;
      freePlan.assetsMax = 5;
      freePlan.stopLoss = false;
      freePlan.realTime = false;
      freePlan.price = 0;
      freePlan.displayFeatures = { version: 1, tradingView: false };
      db.persist(freePlan);
      await db.flush();
      console.log('OK: Free plan created');
    } else {
      console.log('INFO: Free plan already exists');
    }

    let standardPlan = await db.findOne(SubscriptionPlan, {
      name: 'Standard'
    });
    if (!standardPlan) {
      standardPlan = new SubscriptionPlan();
      standardPlan.name = 'Standard';
      standardPlan.monthlyAiCredits = 100;
      standardPlan.assetsMax = 20;
      standardPlan.stopLoss = true;
      standardPlan.realTime = false;
      standardPlan.price = 999; // $9.99
      standardPlan.displayFeatures = { version: 1, tradingView: true };
      db.persist(standardPlan);
      await db.flush();
      console.log('OK: Standard plan created');
    } else {
      console.log('INFO: Standard plan already exists');
    }

    let proPlan = await db.findOne(SubscriptionPlan, { name: 'Pro' });
    if (!proPlan) {
      proPlan = new SubscriptionPlan();
      proPlan.name = 'Pro';
      proPlan.monthlyAiCredits = 500;
      proPlan.assetsMax = 100;
      proPlan.stopLoss = true;
      proPlan.realTime = true;
      proPlan.price = 1999; // $19.99
      proPlan.displayFeatures = { version: 1, tradingView: true };
      db.persist(proPlan);
      await db.flush();
      console.log('OK: Pro plan created');
    } else {
      console.log('INFO: Pro plan already exists');
    }

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

      const userSubscription = new Subscription();
      userSubscription.user = user;
      userSubscription.plan = standardPlan;
      user.subscription = userSubscription;

      db.persist([wallet, user, userSubscription]);
      await db.flush();
      console.log('OK: User and wallet created');
    } else {
      console.log('INFO: Test user already exists');
      await db.populate(user, ['wallet', 'subscription']);
      wallet = user.wallet;
    }

    let maker = await db.findOne(User, { username: 'marketmaker' });
    let makerWallet: Wallet;

    if (!maker) {
      maker = new User();
      maker.fullName = 'Market Maker';
      maker.username = 'marketmaker';
      maker.email = 'maker@virtuex.com';
      maker.password = await bcrypt.hash('password123', 10);
      maker.activated = true;

      makerWallet = new Wallet();
      maker.wallet = makerWallet;

      const makerSubscription = new Subscription();
      makerSubscription.user = maker;
      makerSubscription.plan = proPlan;
      maker.subscription = makerSubscription;

      db.persist([makerWallet, maker, makerSubscription]);
      await db.flush();
      console.log('OK: Market maker user created');
    } else {
      console.log('INFO: Market maker already exists');
      await db.populate(maker, ['wallet', 'subscription']);
      makerWallet = maker.wallet;
    }

    let assetUSD = await db.findOne(Asset, { wallet, currency: usd });
    if (!assetUSD) {
      assetUSD = new Asset();
      assetUSD.wallet = wallet;
      assetUSD.currency = usd;
      assetUSD.amount = BigInt(250000);
      db.persist(assetUSD);
      await db.flush();
      console.log('OK: USD asset created');
    } else {
      console.log('INFO: USD asset already exists');
    }

    let assetEUR = await db.findOne(Asset, { wallet, currency: eur });
    if (!assetEUR) {
      assetEUR = new Asset();
      assetEUR.wallet = wallet;
      assetEUR.currency = eur;
      assetEUR.amount = BigInt(50000);
      db.persist(assetEUR);
      await db.flush();
      console.log('OK: EUR asset created');
    } else {
      console.log('INFO: EUR asset already exists');
    }

    let assetBTC = await db.findOne(Asset, { wallet, currency: btc });
    if (!assetBTC) {
      assetBTC = new Asset();
      assetBTC.wallet = wallet;
      assetBTC.currency = btc;
      assetBTC.amount = BigInt(50000000);
      db.persist(assetBTC);
      await db.flush();
      console.log('OK: BTC asset created');
    } else {
      console.log('INFO: BTC asset already exists');
    }

    let assetETH = await db.findOne(Asset, { wallet, currency: eth });
    if (!assetETH) {
      assetETH = new Asset();
      assetETH.wallet = wallet;
      assetETH.currency = eth;
      assetETH.amount = BigInt(200000000);
      db.persist(assetETH);
      await db.flush();
      console.log('OK: ETH asset created');
    } else {
      console.log('INFO: ETH asset already exists');
    }

    let makerUSD = await db.findOne(Asset, {
      wallet: makerWallet,
      currency: usd
    });
    if (!makerUSD) {
      makerUSD = new Asset();
      makerUSD.wallet = makerWallet;
      makerUSD.currency = usd;
      makerUSD.amount = BigInt(750000);
      db.persist(makerUSD);
      await db.flush();
      console.log('OK: Maker USD asset created');
    } else {
      console.log('INFO: Maker USD asset already exists');
    }

    let makerBTC = await db.findOne(Asset, {
      wallet: makerWallet,
      currency: btc
    });
    if (!makerBTC) {
      makerBTC = new Asset();
      makerBTC.wallet = makerWallet;
      makerBTC.currency = btc;
      makerBTC.amount = BigInt(150000000);
      db.persist(makerBTC);
      await db.flush();
      console.log('OK: Maker BTC asset created');
    } else {
      console.log('INFO: Maker BTC asset already exists');
    }

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

      const tx4 = new Transaction();
      tx4.asset = assetEUR;
      tx4.amount = BigInt(10000);
      tx4.direction = TransactionDirection.Incoming;
      tx4.status = TransactionStatus.Completed;

      db.persist([tx1, tx2, tx3, tx4]);
      await db.flush();
      console.log('OK: Transactions created');
    } else {
      console.log('INFO: Transactions already exist');
    }

    const historyCount = await db.count(CurrencyHistory, { currency: usd });
    if (historyCount === 0) {
      const now = Date.now();
      const historyData: Array<[Currency, bigint, number]> = [
        [usd, BigInt(100), 0],
        [usd, BigInt(100), 1],
        [usd, BigInt(100), 2],
        [eur, BigInt(110), 0],
        [eur, BigInt(109), 1],
        [eur, BigInt(111), 2],
        [btc, BigInt(6500000), 0],
        [btc, BigInt(6420000), 1],
        [btc, BigInt(6580000), 2],
        [eth, BigInt(320000), 0],
        [eth, BigInt(315000), 1],
        [eth, BigInt(328000), 2]
      ];

      const historyRows = historyData.map(([currency, price, daysAgo]) => {
        const entry = new CurrencyHistory();
        entry.currency = currency;
        entry.timestamp = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
        entry.close = price;
        return entry;
      });

      db.persist(historyRows);
      await db.flush();
      console.log('OK: Currency history created');
    } else {
      console.log('INFO: Currency history already exists');
    }

    const existingOrderCount = await db.count(Order, {});
    if (existingOrderCount === 0) {
      const buyOrder = new Order();
      buyOrder.user = user;
      buyOrder.from_asset = assetUSD;
      buyOrder.to_asset = assetBTC;
      buyOrder.amount = BigInt(250000); // $2,500.00 in cents
      buyOrder.status = OrderStatus.Filled;
      buyOrder.type = OrderType.Buy;

      const sellOrder = new Order();
      sellOrder.user = maker;
      sellOrder.from_asset = makerBTC;
      sellOrder.to_asset = makerUSD;
      sellOrder.amount = BigInt(3846153); // ~0.03846153 BTC in satoshis
      sellOrder.status = OrderStatus.Filled;
      sellOrder.type = OrderType.Sell;

      db.persist([buyOrder, sellOrder]);
      await db.flush();
      console.log('OK: Orders created');

      const fulfilled = new FulfilledOrder();
      fulfilled.user = user;
      fulfilled.buy_order = buyOrder;
      fulfilled.sell_order = sellOrder;
      fulfilled.amount = BigInt(3846153); // BTC amount
      fulfilled.price = BigInt(6500000); // $65,000.00 in cents

      db.persist(fulfilled);
      await db.flush();
      console.log('OK: Fulfilled order created');
    } else {
      console.log('INFO: Orders already exist');
    }

    console.log('\nSeed completed successfully.');
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
