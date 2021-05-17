// Portions Copyright (c) 2018-2019, The TurtlePay Developers
// Copyright (c) 2019-2021, The TurtleCoin Developers
//
// Please see the included LICENSE file for more information.

import * as DNS from 'dns';
import { Logger } from '@turtlepay/logger';
import Webapp from '@bitradius/webapp';
import * as dotenv from 'dotenv';
const Config = require('../config.json');

dotenv.config();

DNS.setServers(Config.dnsServers);

type DNSRecord = DNS.MxRecord | DNS.NaptrRecord | DNS.SoaRecord | DNS.AnyRecord | DNS.SrvRecord | string[] | string[][];

const resolve_hostname = async (hostname: string, type = 'ANY'): Promise<DNSRecord> => {
    type = type.toUpperCase();

    return new Promise((resolve, reject) => {
        DNS.resolve(hostname, type, (error, records) => {
            if (error) {
                return reject(error);
            }

            return resolve(records as DNSRecord);
        });
    });
};

(async () => {
    const [controller, app] = await Webapp.create(parseInt(process.env.PORT || '') || 80);

    controller.on('request', (remote_ip, method, url) => {
        Logger.info('[REQUEST] [%s] %s => %s', method, remote_ip, url);
    });

    app.get('/favicon.ico', (request, response) => {
        return response.status(404).send();
    });

    app.get('/robots.txt', (request, response) => {
        return response.status(404).send();
    });

    app.get('/:hostname/:type', async (request, response) => {
        const hostname = request.params.hostname;
        const type = request.params.type;

        try {
            const records = await resolve_hostname(hostname, type);

            return response.json(records);
        } catch (e) {
            Logger.error('Could not lookup [%s:%s]: %s', hostname, type, e.toString());

            return response.status(504).send();
        }
    });

    app.get('/:hostname', async (request, response) => {
        const hostname = request.params.hostname;

        try {
            const records = await resolve_hostname(hostname);

            return response.json(records);
        } catch (e) {
            Logger.error('Could not lookup [%s]: %s', hostname, e.toString());

            return response.status(504).send();
        }
    });

    await controller.start();

    Logger.info('Server started on port %s', parseInt(process.env.PORT || '') || Config.httpPort);
})();
