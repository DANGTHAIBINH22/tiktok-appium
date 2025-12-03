from flask import Flask, request, jsonify
import base64
import cv2
import numpy as np
import pytesseract
from io import BytesIO
from PIL import Image
import re

app = Flask(__name__)


@app.route('/find_text', methods=['POST'])
def find_text():
    data = request.get_json()
    if not data or 'image' not in data or 'text' not in data:
        return jsonify({'error': 'image and text required'}), 400

    try:
        img_b64 = data['image']
        text = data['text']

        img_data = base64.b64decode(img_b64)
        img_np = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(img_np, cv2.IMREAD_COLOR)
        if img is None:
            return jsonify({'error': 'invalid image'}), 400

        # Convert to RGB for tesseract
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # Get word-level boxes
        config = '--psm 6'
        details = pytesseract.image_to_data(rgb, output_type=pytesseract.Output.DICT, config=config)

        n = len(details.get('text', []))
        matches = []
        pattern = re.compile(re.escape(text), re.IGNORECASE)

        for i in range(n):
            word = details['text'][i]
            if not word:
                continue
            if pattern.fullmatch(word) or pattern.search(word):
                left = int(details['left'][i])
                top = int(details['top'][i])
                width = int(details['width'][i])
                height = int(details['height'][i])
                cx = left + width / 2
                cy = top + height / 2
                matches.append({'x': cx, 'y': cy, 'width': width, 'height': height, 'text': word})

        if not matches:
            return jsonify({'found': False}), 200

        m = matches[0]
        return jsonify({'found': True, 'x': m['x'], 'y': m['y'], 'width': m['width'], 'height': m['height']}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/find_image', methods=['POST'])
def find_image():
    """Find a smaller template image inside a larger screenshot.
    Expects JSON: { image: <base64>, template: <base64>, threshold?: float }
    Returns: { found: bool, x, y, width, height, score }
    """
    data = request.get_json()
    if not data or 'image' not in data or 'template' not in data:
        return jsonify({'error': 'image and template required'}), 400

    try:
        img_b64 = data['image']
        tpl_b64 = data['template']
        threshold = float(data.get('threshold', 0.7))

        img_data = base64.b64decode(img_b64)
        img_np = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(img_np, cv2.IMREAD_COLOR)
        if img is None:
            return jsonify({'error': 'invalid image'}), 400

        tpl_data = base64.b64decode(tpl_b64)
        tpl_np = np.frombuffer(tpl_data, np.uint8)
        tpl = cv2.imdecode(tpl_np, cv2.IMREAD_COLOR)
        if tpl is None:
            return jsonify({'error': 'invalid template'}), 400

        # convert to grayscale for matching
        img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        tpl_gray = cv2.cvtColor(tpl, cv2.COLOR_BGR2GRAY)

        # template matching (single-scale). For robust results you can add multi-scale search.
        res = cv2.matchTemplate(img_gray, tpl_gray, cv2.TM_CCOEFF_NORMED)
        min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(res)

        h, w = tpl_gray.shape[:2]

        if max_val >= threshold:
            top_left = max_loc
            center_x = top_left[0] + w / 2
            center_y = top_left[1] + h / 2
            return jsonify({'found': True, 'x': center_x, 'y': center_y, 'width': w, 'height': h, 'score': float(max_val)}), 200
        else:
            return jsonify({'found': False, 'score': float(max_val)}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
