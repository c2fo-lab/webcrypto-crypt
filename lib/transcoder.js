'use strict';
module.exports = exports = function () {

    var transcoder = this;
    
    transcoder.ab2b64 = (arrayBuffer) => {
        if (!arrayBuffer) return;
        var typedArray = Buffer.from(new Uint8Array(arrayBuffer));
        return typedArray.toString('base64');
    }

    transcoder.ab2buf = (ab) => {
        var buf = Buffer.alloc(ab.byteLength);
        var view = new Uint8Array(ab);
        for (var i = 0; i < buf.length; ++i) {
            buf[i] = view[i];
        }
        return buf;
    };

    transcoder.ab2hex = (arrayBuffer) => {
        if (!arrayBuffer) return;
        var typedArray = Buffer.from(new Uint8Array(arrayBuffer));
        return typedArray.toString('hex');
    };

    transcoder.ab2str = (ab) => {
        return Buffer.from(transcoder.ab2buf(ab)).toString('utf8');
    };

    transcoder.ab2uri = (arrayBuffer) => {
        if (!arrayBuffer) return;
        return transcoder.b642uri(
            transcoder.ab2b64(arrayBuffer)
        );
    };

    transcoder.b642buf = (b64) => {
        if (!b64) return;
        return Buffer.from(b64);
    };

    transcoder.b642uint8 = (b64) => {
        if (!b64) return;
        var b64Buffer = Buffer.from(b64, 'base64');
        return transcoder.buf2ab(b64Buffer);
    };
    
    transcoder.b642uri = (b64) => {
        if (!b64) return;
        return b64
            .replace(/=/g,'-')
            .replace(/\+/g,'.')
            .replace(/\//g,'_');
    }
    
    transcoder.buf2ab = (buf) => {
        if (!buf) return;
        var ab = new ArrayBuffer(buf.length);
        var view = new Uint8Array(ab);
        for (var i = 0; i < buf.length; ++i) {
            view[i] = buf[i];
        }
        return ab;
    };
    
    transcoder.buf2b64 = (buf) => {
        if (!buf) return;
        return buf.toString('base64');
    }

    transcoder.buf2hex = (buf) => {
        if (!buf) return;
        return buf.toString('hex');
    }

    transcoder.buf2str = (buf) => {
        if (!buf) return;
        return buf.toString('utf8');
    }

    transcoder.buf2uri = (buf) => {
        if (!buf) return;
        return transcoder.b642uri(
            transcoder.buf2b64(buf)
        );
    }

    transcoder.hex2ab = (hex) => {
        if (!hex) return;
        var hexBuffer = Buffer.from(hex, 'hex');
        return transcoder.buf2ab(hexBuffer);
    };

    transcoder.hex2buf = (hex) => {
        if (!hex) return;
        return Buffer.from(hex, 'hex');
    };

    transcoder.str2ab = (str) => {
        if (!str) return;
        str = Buffer.from(str, 'utf8');
        var arrayBuffer = new ArrayBuffer(str.length);
        var arrayBufferView = new Uint8Array(arrayBuffer);
        for (var i=0, strLen = str.length; i < strLen; i++) {
            arrayBufferView[i] = str[i];
        }
        return arrayBuffer;
    };

    transcoder.str2buf = (str) => {
        if (!str) return;
        var typedArray = transcoder.str2ab(str);
        return Buffer.from(typedArray, 'utf8');
    };

    transcoder.uri2buf = (uriString) => {
        if (!uriString) return;
        var base64 = transcoder.uri2b64(uriString);
        return Buffer.from(base64, 'base64');
    };

};
