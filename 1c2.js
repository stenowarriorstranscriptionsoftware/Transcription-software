var numMissedButMatched = 0;
var startTime;
var typingTimer;

// Initialize typing timer when the page loads
window.onload = function() {
    document.getElementById('paragraphB').addEventListener('input', function() {
        if (!startTime) {
            startTime = new Date();
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

    // AI Analysis Section
    var aiAnalysis = generateAIAnalysis(paragraphA, paragraphB, numHalfDiff, numFullDiff, wpm, accuracyPercentage);
    
    document.getElementById('textBoxC').innerHTML = '<h2>Result Sheet:</h2>' + 
        comparedText + 
        tableContent + 
        '<div style="margin-top: 30px; border-top: 2px solid #4361ee; padding-top: 20px;">' +
        '<h2 style="color: #4361ee;">AI-Powered Feedback</h2>' +
        aiAnalysis +
        '</div>';
    
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

function generateAIAnalysis(originalText, userText, halfMistakes, fullMistakes, wpm, accuracy) {
    // Analyze common mistakes
    const mistakeAnalysis = analyzeMistakes(originalText, userText);
    
    // Generate personalized feedback
    let feedback = '<div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">';
    feedback += '<h3 style="color: #3f37c9; margin-bottom: 10px;">Performance Summary</h3>';
    
    // Overall assessment
    if (accuracy >= 95) {
        feedback += '<p>🌟 <strong>Excellent work!</strong> Your accuracy is outstanding. Keep practicing to maintain this high standard.</p>';
    } else if (accuracy >= 85) {
        feedback += '<p>👍 <strong>Good job!</strong> Your accuracy is above average. With some focused practice, you can reach excellence.</p>';
    } else if (accuracy >= 70) {
        feedback += '<p>📝 <strong>Fair performance.</strong> You\'re on the right track but need to work on reducing errors.</p>';
    } else {
        feedback += '<p>🔍 <strong>Needs improvement.</strong> Focus on accuracy before increasing your speed.</p>';
    }
    
    // Speed assessment
    if (wpm >= 50) {
        feedback += '<p>⚡ <strong>Fast typer!</strong> Your speed is impressive. ';
        if (accuracy < 90) {
            feedback += 'Try slowing down slightly to improve accuracy.</p>';
        } else {
            feedback += 'Maintain this speed while keeping accuracy high.</p>';
        }
    } else if (wpm >= 40) {
        feedback += '<p>🏃 <strong>Moderate speed.</strong> You\'re typing at a good pace. ';
        feedback += 'With practice, you can increase speed without sacrificing accuracy.</p>';
    } else {
        feedback += '<p>🐢 <strong>Slow pace.</strong> Focus on building muscle memory and gradually increasing your speed.</p>';
    }
    
    feedback += '</div>';
    
    // Detailed feedback section
    feedback += '<div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">';
    feedback += '<h3 style="color: #3f37c9; margin-bottom: 10px;">Detailed Feedback</h3>';
    
    // Add mistake analysis
    if (mistakeAnalysis.commonMistakes.length > 0) {
        feedback += '<h4>🔍 Common Mistake Patterns:</h4><ul>';
        mistakeAnalysis.commonMistakes.forEach(mistake => {
            feedback += `<li>${mistake}</li>`;
        });
        feedback += '</ul>';
    }
    
    // Add specific suggestions
    feedback += '<h4>💡 Improvement Suggestions:</h4><ul>';
    
    if (mistakeAnalysis.omissionRate > 0.2) {
        feedback += '<li>You\'re skipping many words. Practice reading ahead to anticipate upcoming words.</li>';
    }
    
    if (mistakeAnalysis.additionRate > 0.15) {
        feedback += '<li>You\'re adding extra words. Focus on typing only what you hear/see.</li>';
    }
    
    if (mistakeAnalysis.spellingErrorRate > 0.25) {
        feedback += '<li>Spelling mistakes are frequent. Consider practicing difficult words separately.</li>';
    }
    
    if (mistakeAnalysis.capitalizationErrorRate > 0.1) {
        feedback += '<li>Watch your capitalization. Remember proper nouns and sentence starts need capitals.</li>';
    }
    
    // Add general tips
    feedback += '<li>Practice difficult sections repeatedly until you master them.</li>';
    feedback += '<li>Try breaking long passages into smaller chunks for focused practice.</li>';
    feedback += '<li>Consider finger placement - proper technique can improve both speed and accuracy.</li>';
    feedback += '</ul>';
    
    // Add practice recommendations
    feedback += '<h4>📚 Recommended Practice:</h4><ul>';
    feedback += `<li>Focus on ${mistakeAnalysis.mostErrorProneWords.length > 0 ? 
        'these words: ' + mistakeAnalysis.mostErrorProneWords.join(', ') + 
        ' or similar patterns' : 'your weakest areas'} for 10 minutes daily</li>`;
    feedback += '<li>Try typing exercises that focus on accuracy before speed</li>';
    feedback += '<li>Use the "slowest comfortable speed" method to build accuracy</li>';
    feedback += '</ul>';
    
    feedback += '</div>';
    
    return feedback;
}

function analyzeMistakes(originalText, userText) {
    // This would analyze the text and return common mistake patterns
    const analysis = {
        commonMistakes: [],
        omissionRate: 0,
        additionRate: 0,
        spellingErrorRate: 0,
        capitalizationErrorRate: 0,
        mostErrorProneWords: []
    };
    
    // Sample analysis - in a real app this would be more sophisticated
    const wordPairs = [];
    const minLength = Math.min(originalText.length, userText.length);
    
    // Find word-by-word differences
    for (let i = 0; i < minLength; i++) {
        const origWord = originalText[i].toLowerCase();
        const userWord = userText[i].toLowerCase();
        
        if (origWord !== userWord) {
            wordPairs.push({ original: originalText[i], user: userText[i] });
        }
    }
    
    // Count different types of errors
    let omissionCount = 0;
    let additionCount = 0;
    let spellingCount = 0;
    let capitalizationCount = 0;
    const errorWords = [];
    
    wordPairs.forEach(pair => {
        const orig = pair.original.toLowerCase();
        const user = pair.user.toLowerCase();
        
        if (user === '') {
            omissionCount++;
        } else if (orig === '') {
            additionCount++;
        } else if (orig === user) {
            capitalizationCount++;
            errorWords.push(pair.original);
        } else if (isSimilar(orig, user)) {
            spellingCount++;
            errorWords.push(pair.original);
        } else {
            // Other types of errors
            errorWords.push(pair.original);
        }
    });
    
    // Calculate rates
    analysis.omissionRate = omissionCount / originalText.length;
    analysis.additionRate = additionCount / originalText.length;
    analysis.spellingErrorRate = spellingCount / originalText.length;
    analysis.capitalizationErrorRate = capitalizationCount / originalText.length;
    
    // Find most common error words
    const wordFrequency = {};
    errorWords.forEach(word => {
        const lowerWord = word.toLowerCase();
        wordFrequency[lowerWord] = (wordFrequency[lowerWord] || 0) + 1;
    });
    
    analysis.mostErrorProneWords = Object.entries(wordFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);
    
    // Generate common mistake descriptions
    if (capitalizationCount > 0) {
        analysis.commonMistakes.push(`Capitalization errors (${capitalizationCount} instances)`);
    }
    if (spellingCount > 0) {
        analysis.commonMistakes.push(`Spelling mistakes (${spellingCount} instances)`);
    }
    if (omissionCount > 0) {
        analysis.commonMistakes.push(`Omitted words (${omissionCount} instances)`);
    }
    if (additionCount > 0) {
        analysis.commonMistakes.push(`Added extra words (${additionCount} instances)`);
    }
    
    return analysis;
}