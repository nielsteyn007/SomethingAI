// DOM Elements
const examForm = document.getElementById('examForm');
const loadingIndicator = document.getElementById('loadingIndicator');
const resultArea = document.getElementById('resultArea');
const examContent = document.getElementById('examContent');
const downloadPdfBtn = document.getElementById('downloadPdf');
const errorMessage = document.getElementById('errorMessage');
const emptyState = document.getElementById('emptyState');

// Utility Functions
const showElement = (element) => {
    element.classList.remove('hidden');
};

const hideElement = (element) => {
    element.classList.add('hidden');
};

const showError = (message) => {
    errorMessage.textContent = message;
    showElement(errorMessage);
    setTimeout(() => {
        hideElement(errorMessage);
    }, 5000);
};

// Form Validation
const validateForm = () => {
    const grade = document.getElementById('grade').value;
    const subject = document.getElementById('subject').value;
    const term = document.querySelector('input[name="term"]:checked');

    if (!grade || !subject || !term) {
        showError('Please fill in all required fields');
        return false;
    }

    return true;
};

// Process HTML content for exams and memos
const processHtmlContent = (data) => {
    try {
        // For debugging purposes
        console.log("Received data:", data);
        
        // Check if data contains exam and memo as JSON strings
        if (data && (data.exam || data.memo)) {
            // Parse the JSON content that's returned as strings with escape characters
            const parseJsonString = (jsonStr) => {
                try {
                    // Clean up the string - remove extra newlines, spaces and escape characters
                    const cleaned = jsonStr.trim().replace(/\\n/g, '');
                    // Try to parse it as JSON directly
                    return JSON.parse(cleaned);
                } catch (error) {
                    console.error("Error parsing JSON string:", error);
                    // If direct parsing fails, try to parse it as a JSON string with escape characters
                    try {
                        // The string might be enclosed in quotes and have escaped quotes inside
                        // This handles strings like: "{\\"key\\":\\"value\\"}"
                        return JSON.parse(JSON.parse(`"${jsonStr.replace(/"/g, '\\"').replace(/\\\\/g, '\\').replace(/\\"/g, '\\"')}"`));
                    } catch (nestedError) {
                        console.error("Error parsing escaped JSON string:", nestedError);
                        return null;
                    }
                }
            };

            // Function to generate HTML for exam content
            const generateExamHtml = (examData) => {
                try {
                    if (!examData) return '<p>No exam data available</p>';
                    
                    return `
                        <h1>${examData.title || 'Exam Paper'}</h1>
                        ${examData.Intro ? `<p class="intro">${examData.Intro}</p>` : ''}
                        ${examData.grade ? `<p><strong>Grade:</strong> ${examData.grade}</p>` : ''}
                        ${examData.subject ? `<p><strong>Subject:</strong> ${examData.subject}</p>` : ''}
                        ${examData.exam && examData.exam.quarter ? `<p><strong>Quarter:</strong> ${examData.exam.quarter}</p>` : ''}
                        ${examData.exam && examData.exam.time ? `<p><strong>Time:</strong> ${examData.exam.time}</p>` : ''}
                        ${examData.exam && examData.exam.totalPoints ? `<p><strong>Total Points:</strong> ${examData.exam.totalPoints}</p>` : ''}
                        
                        <h2>Questions</h2>
                        <ol>
                            ${examData.questions?.map(q => `
                                <li class="question">
                                    <div class="question-header">
                                        <strong>${q.question}</strong>
                                        <span class="type">${q.type} (${q.points} points)</span>
                                    </div>
                                    ${q.options ? `
                                        <div class="options">
                                            <strong>Options:</strong>
                                            <ul>
                                                ${q.options.map(opt => `<li>${opt}</li>`).join('')}
                                            </ul>
                                        </div>` : ''}
                                    ${q.data ? `
                                        <div class="question-data">
                                            <strong>Data:</strong>
                                            <pre>${JSON.stringify(q.data, null, 2)}</pre>
                                        </div>` : ''}
                                    ${q.pairs ? `
                                        <div class="matching-pairs">
                                            <strong>Match the following:</strong>
                                            <ul>
                                                ${q.pairs.map(pair => `<li>${pair.term}</li>`).join('')}
                                            </ul>
                                        </div>` : ''}
                                </li>`
                            ).join('') || '<p>No questions available</p>'}
                        </ol>
                        ${examData.disclaimer ? `<div class="disclaimer">${examData.disclaimer}</div>` : ''}
                    `;
                } catch (error) {
                    console.error("Error generating exam HTML:", error);
                    return `<p>Error generating exam content: ${error.message}</p>`;
                }
            };

            // Function to generate HTML for memo content
            const generateMemoHtml = (memoData) => {
                try {
                    if (!memoData || !memoData.Memorandum) return '<p>No memorandum data available</p>';
                    
                    const memo = memoData.Memorandum;
                    
                    return `
                        <h1>${memo.title || 'Memorandum'}</h1>
                        ${memo.description ? `<p class="memo-description">${memo.description}</p>` : ''}
                        ${memo.grade ? `<p><strong>Grade:</strong> ${memo.grade}</p>` : ''}
                        ${memo.term ? `<p><strong>Term:</strong> ${memo.term}</p>` : ''}
                        
                        <h2>Answers</h2>
                        <ol>
                            ${memo.answers?.map((a, index) => `
                                <li class="answer">
                                    <div class="answer-header">
                                        <strong>Question ${a.number || index + 1}</strong>
                                    </div>
                                    ${a.answer ? `<div class="main-answer"><strong>Answer:</strong> ${
                                        Array.isArray(a.answer) 
                                            ? `<ul>${a.answer.map(item => `<li>${
                                                typeof item === 'object' 
                                                    ? `${item.term}: ${item.definition}` 
                                                    : item
                                            }</li>`).join('')}</ul>` 
                                            : a.answer
                                    }</div>` : ''}
                                    ${a.detailed_solution ? `
                                        <div class="detailed-solution">
                                            <strong>Solution:</strong>
                                            <p>${a.detailed_solution.replace(/\\n/g, '<br>')}</p>
                                        </div>` : ''}
                                    ${a.tips ? `
                                        <div class="tips">
                                            <strong>Tips:</strong>
                                            <p>${a.tips}</p>
                                        </div>` : ''}
                                </li>`
                            ).join('') || '<p>No answers available</p>'}
                        </ol>
                    `;
                } catch (error) {
                    console.error("Error generating memo HTML:", error);
                    return `<p>Error generating memorandum content: ${error.message}</p>`;
                }
            };

            // Process exam content if available
            let processedContent = '';
            if (data.exam) {
                const examData = parseJsonString(data.exam);
                processedContent += generateExamHtml(examData);
            }

            // Add memo content if available (with a divider)
            if (data.memo) {
                const memoData = parseJsonString(data.memo);
                if (processedContent) {
                    processedContent += '<hr class="content-divider">';
                }
                processedContent += generateMemoHtml(memoData);
            }

            // Add custom styles for the rendered content
            processedContent = `
                <style>
                    .question, .answer { 
                        margin: 1.5rem 0; 
                        padding: 1rem; 
                        border: 1px solid #ecf0f1;
                        border-radius: 8px;
                        background-color: white;
                    }
                    .options ul { list-style-type: upper-alpha; }
                    .nested-item { margin-left: 1.5rem; color: #7f8c8d; }
                    .detailed-solution { background: #f8f9fa; padding: 1rem; margin-top: 0.5rem; }
                    .type { float: right; color: #3498db; }
                    .disclaimer { margin-top: 2rem; font-style: italic; }
                    .content-divider {
                        margin: 2rem 0;
                        border: 0;
                        height: 1px;
                        background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(77, 166, 255, 0.75), rgba(0, 0, 0, 0));
                    }
                    h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 0.5rem; }
                    h2 { color: #2c3e50; margin-top: 1.5rem; }
                    .intro { font-style: italic; margin-bottom: 1rem; }
                    .memo-description { font-style: italic; margin-bottom: 1rem; }
                    .main-answer { margin-bottom: 0.5rem; }
                    pre { background: #f8f9fa; padding: 0.5rem; border-radius: 4px; overflow: auto; }
                    .question-data { margin-top: 0.5rem; }
                    .matching-pairs { margin-top: 0.5rem; }
                </style>
                ${processedContent}
            `;

            return processedContent;
        } else {
            // If data doesn't contain expected format, return a fallback
            return `<div class="raw-content"><pre>${JSON.stringify(data, null, 2)}</pre></div>`;
        }
    } catch (error) {
        console.error('Error processing content:', error);
        return `<div class="error-content">
            <h3>Error processing content</h3>
            <p>${error.message}</p>
            <pre>${JSON.stringify(data, null, 2)}</pre>
        </div>`;
    }
};

// API Call
const generateExamPaper = async (formData) => {
    try {
        const response = await fetch('https://n8n-ysz1.onrender.com/webhook-test/6a4e6a6d-8726-4aa4-a7fa-770894ed3422', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error('Failed to generate exam paper. Please try again later.');
    }
};

// PDF Generation
const generatePDF = () => {
    // Get the content from the exam content div
    const contentElement = examContent;
    
    // Generate filename
    const grade = document.getElementById('grade').value;
    const subject = document.getElementById('subject').value;
    const term = document.querySelector('input[name="term"]:checked').value;
    const filename = `${subject}_${grade}_${term}_Test.pdf`;
    
    // Show loading indicator during PDF generation
    showElement(loadingIndicator);
    
    // PDF configuration options
    const options = {
        margin: [10, 10, 10, 10],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: false
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Generate PDF using html2pdf
    html2pdf().from(contentElement).set(options).save()
        .then(() => {
            hideElement(loadingIndicator);
        })
        .catch(error => {
            hideElement(loadingIndicator);
            showError('Error generating PDF: ' + error.message);
            console.error('PDF generation error:', error);
            
            // Fallback to simpler jsPDF method if html2pdf fails
            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                
                // Extract text content
                const textContent = contentElement.textContent.trim();
                
                // Add content to PDF
                doc.setFontSize(12);
                const splitText = doc.splitTextToSize(textContent, 180);
                doc.text(splitText, 15, 15);
                
                // Save the PDF
                doc.save(filename);
            } catch (fallbackError) {
                showError('PDF generation failed. Please try again.');
                console.error('Fallback PDF generation error:', fallbackError);
            }
        });
};

// Show Paper Content
const showPaperContent = (content) => {
    hideElement(emptyState);
    examContent.innerHTML = content;
    showElement(examContent);
    showElement(downloadPdfBtn);
};

// Event Handlers
examForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    const formData = {
        grade: document.getElementById('grade').value,
        subject: document.getElementById('subject').value,
        term: document.querySelector('input[name="term"]:checked').value,
    };

    try {
        // Show loading indicator
        showElement(loadingIndicator);

        // Generate exam paper
        const result = await generateExamPaper(formData);

        // Hide loading
        hideElement(loadingIndicator);

        // Process and display result
        if (result) {
            const processedContent = processHtmlContent(result);
            showPaperContent(processedContent);
        } else {
            showError('No content was generated. Please try again.');
        }
    } catch (error) {
        hideElement(loadingIndicator);
        showError(error.message);
    }
});

downloadPdfBtn.addEventListener('click', generatePDF);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    hideElement(loadingIndicator);
    hideElement(examContent);
    hideElement(downloadPdfBtn);
    hideElement(errorMessage);
}); 