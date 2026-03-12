import {
    generatePrivateKey,
    getPubKeyFromSecret,
    signCampaigns,
    type OpenCampaignsSchema,
    type Campaign
} from '@opencampaigns/sdk';

function byteToHex(byte: number) {
    return byte.toString(16).padStart(2, '0');
}

function toHex(buffer: Uint8Array) {
    return Array.from(buffer).map(byteToHex).join('');
}

function fromHex(hexStr: string): Uint8Array {
    const bytes = new Uint8Array(hexStr.length / 2);
    for (let i = 0; i < hexStr.length; i += 2) {
        bytes[i / 2] = parseInt(hexStr.substring(i, i + 2), 16);
    }
    return bytes;
}

declare global {
    interface Window {
        ocData: any;
        jQuery: any;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const btnGenerate = document.getElementById('oc_generate_keys');
    const btnSync = document.getElementById('oc_sync_campaigns');

    if (btnGenerate) {
        btnGenerate.addEventListener('click', () => {
            try {
                const privKeyBytes = generatePrivateKey();
                const pubKeyHex = getPubKeyFromSecret(privKeyBytes);

                const privInput = document.getElementById('oc_privkey') as HTMLInputElement;
                const pubInput = document.getElementById('oc_pubkey') as HTMLInputElement;

                if (privInput && pubInput) {
                    privInput.value = toHex(privKeyBytes);
                    pubInput.value = pubKeyHex;
                }
                alert('Keys generated! Please click "Save Changes" at the bottom of the form.');
            } catch (err) {
                console.error(err);
                alert('Failed to generate keys.');
            }
        });
    }

    if (btnSync) {
        btnSync.addEventListener('click', async () => {
            const $ = window.jQuery;
            const resultDiv = document.getElementById('oc_sync_result');
            if (resultDiv) resultDiv.innerText = 'Syncing...';

            try {
                // In a complete WP plugin, we would fetch the WooCommerce product data via a standard
                // WP REST API endpoint here. For the MVP, we assume a representative demo campaign set 
                // to validate the cryptography and payload architecture locally.
                const tracking = window.ocData.tracking;
                const campaigns: Campaign[] = [
                    {
                        id: 'woo-sample-123',
                        type: 'offer',
                        title: 'WooCommerce Sample Product',
                        url: window.ocData.website + '/product/sample',
                        tags: ['sample', 'woo'],
                        tracking: tracking
                    }
                ];

                const privKeyHex = window.ocData.privkey;
                if (!privKeyHex) throw new Error('Private key missing. Generate and save settings first.');

                const privKeyBytes = fromHex(privKeyHex);
                const signature = signCampaigns(campaigns, privKeyBytes);

                const schema: OpenCampaignsSchema = {
                    version: "1.0",
                    publisher: {
                        name: window.ocData.brand,
                        website: window.ocData.website,
                        pubkey: window.ocData.pubkey
                    },
                    campaigns: campaigns,
                    signature: signature
                };

                // Save the JSON payload physically/in DB for /.well-known to emit
                $.post(window.ocData.ajax_url, {
                    action: 'opencampaigns_save_payload',
                    nonce: window.ocData.nonce,
                    payload: JSON.stringify(schema, null, 2)
                }, (res: any) => {
                    if (res.success) {
                        if (resultDiv) resultDiv.innerHTML = '<span style="color:green;">' + res.data + '</span>';
                    } else {
                        if (resultDiv) resultDiv.innerHTML = '<span style="color:red;">Error: ' + res.data + '</span>';
                    }
                });

            } catch (err: any) {
                if (resultDiv) resultDiv.innerHTML = '<span style="color:red;">' + err.message + '</span>';
            }
        });
    }
});
