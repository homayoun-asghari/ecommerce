import React from "react";
import "../styles/Footer.css"
import { Row, Col, Container } from 'react-bootstrap';
import Searchbar from "./Searchbar";
import visa from "../assets/visa.png";
import payment from "../assets/payment.png";
import paypal from "../assets/paypal.png";
import skrill from "../assets/skrill.png";
import klarna from "../assets/klarna.png";
import googlePlay from "../assets/googlePlay.png";
import appStore from "../assets/appStore.png";
import { Telephone, Envelope, Facebook, Instagram, Twitter } from "react-bootstrap-icons";
import { Nav } from "react-bootstrap";
import { useTheme } from '../contexts/ThemeContext.jsx';
import { Send } from "react-bootstrap-icons";
import { useLanguage } from '../hooks/useLanguage';

function Footer() {
    const year = new Date().getFullYear();
    const { mode } = useTheme();
    const { t } = useLanguage();

    return (
        <Container fluid className={`footer g-5 ${mode ? "footer-light" : "footer-dark"}`}>
            <Row lg={6} md={12}>
                <Col lg={8} md={12} >
                    <h5>{t('footer:newsletter.title')}</h5>
                    <p>{t('footer:newsletter.description')}</p>
                </Col>

                <Col lg={4} md={12} className="d-flex flex-column align-items-end">
                    <Searchbar button={<><Send /> </>} placeholder={t('footer:newsletter.emailPlaceholder')} />
                    <p className="py-3">{t('footer:newsletter.terms')}</p>
                </Col>
            </Row>


            <Row className="d-flex justify-content-center gap-5" lg={6} md={12} >
                <Col>
                    <h5>{t('footer:help.title')}</h5>
                    <p>{t('footer:help.address')}</p>

                    <p style={{ margin: "0" }}>{t('footer:help.hours')}</p>
                    <h6>{<Telephone />} {t('footer:help.phone')}</h6>

                    <p className="text-nowrap" style={{ margin: "0" }}>{t('footer:help.orderHelp')}</p>
                    <h6>{<Envelope />} {t('footer:help.email')}</h6>
                </Col>

                <Col>
                    <h5>{t('footer:makeMoney')}</h5>
                    <Nav className="flex-column text-nowrap">
                        <Nav.Link href="/">
                            {t('footer:makeMoneyOptions.sellOnGrogin')}
                        </Nav.Link>
                        <Nav.Link href="/">
                            {t('footer:makeMoneyOptions.sellServices')}
                        </Nav.Link>
                        <Nav.Link href="/">
                            {t('footer:makeMoneyOptions.sellBusiness')}
                        </Nav.Link>
                        <Nav.Link href="/">
                            {t('footer:makeMoneyOptions.sellApps')}
                        </Nav.Link>
                        <Nav.Link href="/">
                            {t('footer:makeMoneyOptions.becomeAffiliate')}
                        </Nav.Link>
                        <Nav.Link href="/">
                            {t('footer:makeMoneyOptions.advertiseProducts')}
                        </Nav.Link>
                        <Nav.Link href="/">
                            {t('footer:makeMoneyOptions.sellPublish')}
                        </Nav.Link>
                        <Nav.Link href="/">
                            {t('footer:makeMoneyOptions.becomeVendor')}
                        </Nav.Link>
                    </Nav>
                </Col>

                <Col>
                    <h5>{t('footer:helpYou.title')}</h5>
                    <Nav className="flex-column text-nowrap">
                        <Nav.Link href="/">
                            {t('footer:helpYou.accessibility')}
                        </Nav.Link>
                        <Nav.Link href="/">
                            {t('footer:helpYou.orders')}
                        </Nav.Link>
                        <Nav.Link href="/">
                            {t('footer:helpYou.returns')}
                        </Nav.Link>
                        <Nav.Link href="/">
                            {t('footer:helpYou.shipping')}
                        </Nav.Link>
                        <Nav.Link href="/">
                            {t('footer:helpYou.refundPolicy')}
                        </Nav.Link>
                        <Nav.Link href="/">
                            {t('footer:helpYou.privacy')}
                        </Nav.Link>
                        <Nav.Link href="/">
                            {t('footer:helpYou.terms')}
                        </Nav.Link>
                        <Nav.Link href="/">
                            {t('footer:helpYou.cookieSettings')}
                        </Nav.Link>
                        <Nav.Link href="/">
                            {t('footer:helpYou.helpCenter')}
                        </Nav.Link>
                    </Nav>
                </Col>
                <Col>
                    <h5>{t('footer:aboutUs.title')}</h5>
                    <Nav className="flex-column text-nowrap">
                        <Nav.Link href="/">
                            {t('footer:aboutUs.careers')}
                        </Nav.Link>
                        <Nav.Link href="/">
                            {t('footer:aboutUs.about')}
                        </Nav.Link>
                        <Nav.Link href="/">
                            {t('footer:aboutUs.investor')}
                        </Nav.Link>
                        <Nav.Link href="/">
                            {t('footer:aboutUs.devices')}
                        </Nav.Link>
                        <Nav.Link href="/">
                            {t('footer:aboutUs.reviews')}
                        </Nav.Link>
                        <Nav.Link href="/">
                            {t('footer:aboutUs.social')}
                        </Nav.Link>
                        <Nav.Link href="/">
                            {t('footer:aboutUs.locations')}
                        </Nav.Link>
                    </Nav>
                </Col>

            </Row>

            <Row className="py-3">
                <Col className="d-flex flex-column align-items-start">
                    <h5>{t('footer:downloadApp.title')}</h5>
                    <Nav.Link href="/">
                        <img src={googlePlay} alt={t('footer:downloadApp.googlePlayAlt')} />
                    </Nav.Link>
                    <p className="text-nowrap" style={{ paddingLeft: "var(--space-xs)" }}>
                        {t('footer:downloadApp.discountText')}
                    </p>
                    <Nav.Link href="/">
                        <img src={appStore} alt={t('footer:downloadApp.appStoreAlt')} />
                    </Nav.Link>
                    <p className="text-nowrap" style={{ paddingLeft: "var(--space-xs)" }}>
                        {t('footer:downloadApp.discountText2')}
                    </p>
                </Col>

                <Col className="d-flex flex-column align-items-end">
                    <div className="d-flex flex-column align-items-start">
                        <h5>{t('footer:followUs.title')}</h5>

                        <Nav>
                            <Nav.Link href="/" aria-label={t('footer:followUs.facebook')}>
                                <h6>{<Facebook />}</h6>
                            </Nav.Link>
                            <Nav.Link href="/" aria-label={t('footer:followUs.instagram')}>
                                <h6>{<Instagram />}</h6>
                            </Nav.Link>
                            <Nav.Link href="/" aria-label={t('footer:followUs.twitter')}>
                                <h6>{<Twitter />}</h6>
                            </Nav.Link>
                        </Nav>

                        <p style={{ paddingTop: "var(--space-md)", margin: "0" }}>{t('footer:paymentMethods')}:</p>
                        <span>
                            <img src={visa} alt={t('footer:paymentIcons.visa')} />
                            <img src={payment} alt={t('footer:paymentIcons.payment')} />
                            <img src={paypal} alt={t('footer:paymentIcons.paypal')} />
                            <img src={skrill} alt={t('footer:paymentIcons.skrill')} />
                            <img src={klarna} alt={t('footer:paymentIcons.klarna')} />
                        </span>
                    </div>

                </Col>
            </Row>


            <Row lg={6} md={12} >
                <Col lg={6} md={12} className="d-flex align-items-end justify-content-start">
                    <p style={{ marginBottom: "0px" }}>
                        {t('footer:copyright', { year })}
                    </p>
                </Col>

                <Col lg={6} md={12} className="d-flex flex-column align-items-end">
                    <Nav>
                        <Nav.Link href="/">
                            {t('footer:footerLinks.terms')}
                        </Nav.Link>
                        <Nav.Link href="/">
                            {t('footer:footerLinks.privacy')}
                        </Nav.Link>
                        <Nav.Link href="/">
                            {t('footer:footerLinks.tracking')}
                        </Nav.Link>
                    </Nav>
                </Col>

            </Row>
            <div
                style={{
                    height: "55px",
                    backgroundColor: mode ? "var(--color-secondary)" : "black",
                }}
            ></div>

        </Container>
    );
}


export default Footer;