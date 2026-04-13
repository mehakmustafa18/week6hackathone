import { Mail, Link2 } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.newsletter} container`}>
        <div className={styles.newsletterBox}>
          <h2>STAY UPTO DATE ABOUT<br />OUR LATEST OFFERS</h2>
          <div className={styles.newsletterInputs}>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} size={20} />
              <input type="text" placeholder="Enter your email address" />
            </div>
            <button className={styles.subscribeBtn}>Subscribe to Newsletter</button>
          </div>
        </div>
      </div>

      <div className={`${styles.mainFooter} container`}>
        <div className={styles.brandCol}>
          <h1 className={styles.logo}>SHOP.CO</h1>
          <p className={styles.description}>
            We have clothes that suits your style and which you're proud to wear.
            From women to men.
          </p>
          <div className={styles.socials}>
            <div className={styles.socialIcon}><img src="/assets/1.png" alt="Twitter" className={styles.socialImage} /></div>
            <div className={styles.socialIcon}><img src="/assets/2.png" alt="Facebook" className={styles.socialImage} /></div>
            <div className={styles.socialIcon}><img src="/assets/3.png" alt="Instagram" className={styles.socialImage} /></div>
            <div className={styles.socialIcon}><img src="/assets/4.png" alt="Github" className={styles.socialImage} /></div>
          </div>
        </div>

        <div className={styles.linksCols}>
          <div className={styles.col}>
            <h4>COMPANY</h4>
            <ul>
              <li>About</li>
              <li>Features</li>
              <li>Works</li>
              <li>Career</li>
            </ul>
          </div>
          <div className={styles.col}>
            <h4>HELP</h4>
            <ul>
              <li>Customer Support</li>
              <li>Delivery Details</li>
              <li>Terms & Conditions</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
          <div className={styles.col}>
            <h4>FAQ</h4>
            <ul>
              <li>Account</li>
              <li>Manage Deliveries</li>
              <li>Orders</li>
              <li>Payments</li>
            </ul>
          </div>
          <div className={styles.col}>
            <h4>RESOURCES</h4>
            <ul>
              <li>Free eBooks</li>
              <li>Development Tutorial</li>
              <li>How to - Blog</li>
              <li>Youtube Playlist</li>
            </ul>
          </div>
        </div>
      </div>

      <div className={`${styles.bottomBar} container`}>
        <p>Shop.co © 2000-2023, All Rights Reserved</p>
        <div className={styles.payments}>
          <div className={styles.paymentBadge}><img src="/assets/Badge (4).png" alt="Visa" /></div>
          <div className={styles.paymentBadge}><img src="/assets/Badge.png" alt="Visa" /></div>
          <div className={styles.paymentBadge}><img src="/assets/Badge (1).png" alt="Mastercard" /></div>
          <div className={styles.paymentBadge}><img src="/assets/Badge (2).png" alt="PayPal" /></div>
          <div className={styles.paymentBadge}><img src="/assets/Badge (3).png" alt="ApplePay" /></div>
        </div>
      </div>
    </footer>
  );
}
