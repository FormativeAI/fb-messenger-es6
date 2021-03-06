import validate from '../util/validate';
import GreetingText from './greetingText';
import TargetAudience from './targetAudience';
import ChatExtensionHomeUrl from './chatExtensionHome';
import {
    PersistentMenu,
}
from './menu';


export default class MessengerProfile {
    constructor() {
        this.state = {};
        return this;
    }

    static validProperties() {
        return [
            'persistent_menu',
            'get_started',
            'greeting',
            'whitelisted_domains',
            'account_linking_url',
            'payment_settings',
            'target_audience',
            'home_url',
        ];
    }

    setGetStartedButton(payload) {
        validate.stringLength(payload, null, 1000, 'get_started.payload', 'MessengerProfile.setGetStartedButton');
        this.state.get_started = {
            payload: payload,
        };
        return this;
    }

    addGreetingText(greetingText) {
        validate.oneOf(greetingText.constructor.name, [GreetingText.name], 'greeting_text.type', 'MessengerProfile.addGreetingText');
        if (validate.null(this.greeting)) {
            this.state.greeting = [];
        }
        this.state.greeting.push(greetingText);
        return this;
    }

    addWhitelistedDomain(domain) {
        validate.url(domain, 'MessengerProfile.addWhitelistedDomain');
        if (validate.null(this.state.whitelisted_domains)) {
            this.state.whitelisted_domains = [];
        }
        else {
            validate.length(this.state.whitelisted_domains, null, 9, 'whitelisted_domains', 'MessengerProfile.addWhitelistedDomain');
        }
        this.state.whitelisted_domains.push(domain);
        return this;
    }

    setAccountLinkingUrl(url) {
        validate.url(url, 'MessengerProfile.addAccountLinkingUrl');
        this.state.account_linking_url = url;
        return this;
    }

    setTargetAudience(audience) {
        validate.oneOf(audience.constructor.name, [TargetAudience.name], 'target_audience.type', 'MessengerProfile.setTargetAudience');
        if (audience.audience_type === 'custom' && validate.empty(audience.countries.whitelist) && validate.empty(audience.countries.blacklist)) {
            throw new Error('MessengerProfile.setTargetAudience: If audience_type is custom, blacklist and whitelist can\'t both be null or empty. In addition, only one of them can be non-empty at the same time.');
        }
        this.state.target_audience = audience;
        return this;
    }

    addPersistentMenu(menu) {
        validate.oneOf(menu.constructor.name, [PersistentMenu.name], 'persistent_menu.type', 'MessengerProfile.addPersistentMenu');
        if (menu.composer_input_disabled === true && validate.empty(menu.call_to_actions)) {
            throw new Error('PersistentMenu.disableUserInput: Either composer_input_disabled is false or call_to_actions must be set');
        }
        if (validate.null(this.state.persistent_menu)) {
            this.state.persistent_menu = [];
        }
        this.state.persistent_menu.push(menu);
        return this;
    }

    // Use this for reading and deleting bot's properties
    setFields(fields) {
        validate.isArray(fields, 'fields', 'MessengerProfile.setFields');
        for (const field of fields) {
            validate.isString(field, 'field.type', 'MessengerProfile.setFields');
        }
        for (const field of fields) {
            validate.oneOf(field, MessengerProfile.validProperties(), 'profile property', 'MessengerProfile.setFields');
        }
        this.state = {
            fields: fields,
        };
        return this;
    }

    checkDefaultLocale(arg, name) {
        if (!validate.null(arg)) {
            let hasDefault = false;
            for (const obj of arg) {
                if (obj.locale === 'default') {
                    hasDefault = true;
                }
            }
            if (!hasDefault) {
                throw new Error(`MessengerProfile.toObject:  You must at least specify a ${name} for the default locale`);
            }
        }
        return this;
    }

    setPaymentSettings(settings) {
        validate.notEmpty(settings, 'payment_settings', 'MessengerProfile.setPaymentSettings');
        this.state.payment_settings = settings;
        return this;
    }

    setChatExtensionHomeUrl(chatExtensionHomeUrl) {
        validate.oneOf(chatExtensionHomeUrl.constructor.name, [ChatExtensionHomeUrl.name], 'home_url', 'MessengerProfile.setChatExtensionHomeUrl');
        this.state.home_url = chatExtensionHomeUrl;
        return this;
    }

    toObject() {
        this.checkDefaultLocale(this.state.persistent_menu, 'persistent_menu');
        this.checkDefaultLocale(this.state.greeting, 'greeting');
        if (!validate.null(this.state.persistent_menu) && validate.null(this.state.get_started)) {
            throw new Error('MessengerProfile.toObject: You must set a Get Started button if you also wish to use persistent menu');
        }
        return this.state;
    }

}
