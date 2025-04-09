var numMissedButMatched = 0;
var startTime;
var typingTimer;

// Initialize typing timer when the page loads
window.onload = function() {
    document.getElementById('paragraphB').addEventListener('input', function() {
        if (!startTime) {
            startTime = new Date();
            // Reset timer if user starts typing again
            clearTimeout(typingTimer);
            typingTimer = setTimeout(function() {
                // Consider typing finished after 5 seconds of inactivity
                compareParagraphs();
            }, 5000);
        }
    });
};

function checkForMatchingWords(word, paragraph, startIndex) {
    var wordsToCheck = 1;
    for (var i = 0; i < wordsToCheck && (startIndex + i) < paragraph.length; i++) {
        var nextWord = paragraph[startIndex + i];
        if (word === nextWord) {
            return true;
        }
    }
    return false;
}

function isSimilar(wordA, wordB) {
    var minLength = Math.min(wordA.length, wordB.length);
    var maxLength = Math.max(wordA.length, wordB.length);
    var similarCount = 0;
    var threshold = 50;
    for (var i = 0; i < minLength; i++) {
        if (wordA[i] === wordB[i]) {
            similarCount++;
        }
    }
    var similarityPercentage = (similarCount / maxLength) * 100;
    return similarityPercentage >= threshold;
}

function arraysAreEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (var i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

function compareParagraphs() {
    var paragraphA = document.getElementById('paragraphA').value
        .replace(/<[^>]*>/g, '')
        .replace(/[\u2018\u2019]/g, "'")
        .trim()
        .split(/\s+/);

    var paragraphB = document.getElementById('paragraphB').value
        .replace(/<[^>]*>/g, '')
        .replace(/[\u2018\u2019]/g, "'")
        .trim()
        .split(/\s+/);

    var comparedText = '';
    var numHalfDiff = 0;
    var numFullDiff = 0;
    var wordAIndex = 0;
    var wordBIndex = 0;

    comparedText += '<div style="border: 1px solid green; width: 930px; padding: 5px; border-radius: 4px; margin-bottom: 10px;">';

    comparedText += '<div style="display: flex; align-items: center; margin-bottom: 5px;">';
    comparedText += '<div style="width: 20px; height: 20px; color: red; border-radius: 4px;">■</div>';
    comparedText += '<strong style="margin-left: 5px;">Addition of word.</strong>';
    comparedText += '</div>';

    comparedText += '<div style="display: flex; align-items: center; margin-bottom: 5px;">';
    comparedText += '<div style="width: 20px; height: 20px; color: blue; border-radius: 4px;">■</div>';
    comparedText += '<strong style="margin-left: 5px;">Omission of word.</strong>';
    comparedText += '</div>';

    comparedText += '<div style="display: flex; align-items: center; margin-bottom: 10px;">';
    comparedText += '<div style="width: 20px; height: 20px; color: orange; border-radius: 4px;">■</div>';
    comparedText += '<strong style="margin-left: 5px;">Spelling Mistakes</strong>';
    comparedText += '</div>';

    comparedText += '<div style="display: flex; align-items: center; margin-bottom: 10px;">';
    comparedText += '<div style="width: 20px; height: 20px; color: purple; border-radius: 4px;">■</div>';
    comparedText += '<strong style="margin-left: 5px;">Capitalization Mistakes</strong>';
    comparedText += '</div>';

    comparedText += '</div>';

    // Special case: if paragraphB is empty, count all words in paragraphA as omissions
    if (paragraphB.length === 0) {
        comparedText += paragraphA.map(word => '<span style="color: blue;">' + word + '</span>').join(' ');
        numFullDiff = paragraphA.length;
        wordAIndex = paragraphA.length;
    } 
    // Special case: if paragraphA is empty, count all words in paragraphB as additions
    else if (paragraphA.length === 0) {
        comparedText += paragraphB.map(word => '<span style="color: red; text-decoration: line-through;">' + word + '</span>').join(' ');
        numFullDiff = paragraphB.length;
        wordBIndex = paragraphB.length;
    }
    else {
        // Normal comparison when both paragraphs have content
        while (wordAIndex < paragraphA.length || wordBIndex < paragraphB.length) {
            var wordA = paragraphA[wordAIndex] || '';
            var wordB = paragraphB[wordBIndex] || '';
            var cleanWordA = wordA.replace(/[,\?\-\s]/g, '');
            var cleanWordB = wordB.replace(/[,\?\-\s]/g, '');

            if (cleanWordA === cleanWordB) {
                comparedText += '<span style="color: green;">' + wordA + '</span> ';
                wordAIndex++;
                wordBIndex++;
            } else if (cleanWordA.toLowerCase() === cleanWordB.toLowerCase()) {
                comparedText += '<span style="color: purple;">' + wordA + '</span> ';
                comparedText += '<span style="text-decoration: line-through; text-decoration-color: green; color: purple;">' + wordB + '</span> ';
                wordAIndex++;
                wordBIndex++;
                numHalfDiff++;
            } else {
                if (!wordA) {
                    comparedText += '<span style="color: red; text-decoration: line-through;">' + wordB + '</span> ';
                    wordBIndex++;
                    numFullDiff++;
                } else if (!wordB) {
                    comparedText += '<span style="color: blue;">' + wordA + '</span> ';
                    wordAIndex++;
                    numFullDiff++;
                } else {
                    if (wordA === paragraphB[wordBIndex]) {
                        comparedText += '<span style="color: orange;">' + wordA + '</span> ';
                        wordAIndex++;
                        wordBIndex++;
                    } else if (wordB === paragraphA[wordAIndex]) {
                        comparedText += '<span style="text-decoration: line-through; text-decoration-color: green; color: orange;">' + wordB + '</span> ';
                        wordAIndex++;
                        wordBIndex++;
                    } else if (isSimilar(wordA, wordB)) {
                        comparedText += '<span style="color: orange;">' + wordA + '</span> ';
                        comparedText += '<span style="text-decoration: line-through; text-decoration-color: green; color: orange;">' + wordB + '</span> ';
                        wordAIndex++;
                        wordBIndex++;
                        numHalfDiff++;
                    } else {
                        var pairA = [wordA];
                        var pairB = [wordB];
                        for (var i = 1; i < 5 && (wordBIndex + i) < paragraphB.length; i++) {
                            pairB.push(paragraphB[wordBIndex + i]);
                        }
                        for (var i = 1; i < 5 && (wordAIndex + i) < paragraphA.length; i++) {
                            pairA.push(paragraphA[wordAIndex + i]);
                        }

                        var foundPairInA = false;
                        for (var i = 1; i <= 50 && (wordAIndex + i) < paragraphA.length; i++) {
                            var subarrayA = paragraphA.slice(wordAIndex + i, wordAIndex + i + pairB.length);
                            if (arraysAreEqual(subarrayA, pairB)) {
                                for (var j = 0; j < i; j++) {
                                    comparedText += '<span style="color: blue;">' + paragraphA[wordAIndex + j] + '</span> ';
                                    numFullDiff++;
                                }
                                comparedText += '<span style="color: green;">' + pairB.join(' ') + '</span> ';
                                wordAIndex += i + pairB.length;
                                wordBIndex += pairB.length;
                                foundPairInA = true;
                                break;
                            }
                        }

                        if (!foundPairInA) {
                            var foundPairInB = false;
                            for (var i = 1; i <= 50 && (wordBIndex + i) < paragraphB.length; i++) {
                                var subarrayB = paragraphB.slice(wordBIndex + i, wordBIndex + i + pairA.length);
                                if (arraysAreEqual(subarrayB, pairA)) {
                                    for (var j = 0; j < i; j++) {
                                        comparedText += '<span style="color: red; text-decoration: line-through; text-decoration-color: green;">' + paragraphB[wordBIndex + j] + '</span> ';
                                        numFullDiff++;
                                    }
                                    comparedText += '<span style="color: green;">' + pairA.join(' ') + '</span> ';
                                    wordAIndex += pairA.length;
                                    wordBIndex += i + pairA.length;
                                    foundPairInB = true;
                                    break;
                                }
                            }

                            if (!foundPairInB) {
                                if (wordB === paragraphA[wordAIndex + 1]) {
                                    var match = checkForMatchingWords(wordA, paragraphB, wordBIndex);
                                    comparedText += '<span style="color: green;">' + wordA + '</span> ';
                                    comparedText += '<span>' + wordB + '</span> ';
                                    wordAIndex += 2;
                                    wordBIndex++;
                                    numMissedButMatched++;
                                    numFullDiff++;
                                } else if (wordA === paragraphB[wordBIndex + 1]) {
                                    var match = checkForMatchingWords(wordB, paragraphA, wordAIndex);
                                    comparedText += '<span style="color: red; text-decoration: line-through; text-decoration-color: green;">' + wordB + '</span> ';
                                    comparedText += '<span>' + wordA + '</span> ';
                                    wordBIndex += 2;
                                    wordAIndex++;
                                    numMissedButMatched++;
                                    numFullDiff++;
                                } else {
                                    comparedText += '<span style="color: blue;">' + wordA + '</span> ';
                                    comparedText += '<span style="color: red; text-decoration: line-through; text-decoration-color: green;">' + wordB + '</span> ';
                                    wordAIndex++;
                                    wordBIndex++;
                                    // Only count one full mistake per word pair
                                    numFullDiff++;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    var keystrokesCount = document.getElementById('paragraphB').value.length;
    var errorPercentage = paragraphA.length > 0 ? Math.min(100, ((numHalfDiff / 2) + numFullDiff) / paragraphA.length * 100) : 0;
    var accuracyPercentage = Math.max(0, 100 - errorPercentage);
    
    // Calculate WPM (Words Per Minute)
    var endTime = new Date();
    var typingTimeSeconds = startTime ? (endTime - startTime) / 1000 : 60; // Default to 60 seconds if no start time
    var typingTimeMinutes = typingTimeSeconds / 60;
    var wordsTyped = paragraphB.length;
    var wpm = typingTimeMinutes > 0 ? Math.round(wordsTyped / typingTimeMinutes) : 0;

    var tableContent =
        '<h2>Analysis:</h2>' +
        '<table>' +
        '<tr>' +
        '<th style="border: 2px solid green;">Total Words (Original)</th>' +
        '<th style="border: 2px solid green;">Total Words (Yours)</th>' +
        '<th style="border: 2px solid green;">Half Mistakes</th>' +
        '<th style="border: 2px solid green;">Full Mistakes</th>' +
        '<th style="border: 2px solid green;">Keystrokes</th>' +
        '<th style="border: 2px solid green;">Typing Speed (WPM)</th>' +
        '<th style="border: 2px solid green;">Accuracy</th>' +
        '<th style="border: 2px solid green;">Errors</th>' +
        '</tr>' +
        '<tr>' +
        '<td style="border: 2px solid green;">' + paragraphA.length + '</td>' +
        '<td style="border: 2px solid green;">' + paragraphB.length + '</td>' +
        '<td style="border: 2px solid green;">' + numHalfDiff + '</td>' +
        '<td style="border: 2px solid green;">' + numFullDiff + '</td>' +
        '<td style="border: 2px solid green;">' + keystrokesCount + '</td>' +
        '<td style="border: 2px solid green;">' + wpm + '</td>' +
        '<td style="border: 2px solid green;">' + accuracyPercentage.toFixed(2) + '%</td>' +
        '<td style="border: 2px solid green;">' + errorPercentage.toFixed(2) + '%</td>' +
        '</tr>' +
        '</table>';

    document.getElementById('textBoxC').innerHTML = '<h2>Result Sheet:</h2>' + comparedText + tableContent;
    document.getElementById('textBoxC').style.display = 'block';
    document.getElementById('textBoxC').style.border = '2px solid green';

    var differenceSpans = document.querySelectorAll('#textBoxC span[style*="color:"]');
    differenceSpans.forEach(function (span) {
        span.style.fontWeight = 'bold';
    });
    
    // Reset timer for next comparison
    startTime = null;
    clearTimeout(typingTimer);
}