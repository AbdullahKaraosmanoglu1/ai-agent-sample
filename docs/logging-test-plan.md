# Logging System Test Plan

## Setup Verification
```bash
# Check if required files exist and modules are loaded
ls src/core/infrastructure/logging/
ls logs/
```

## Test Endpoints

### 1. Test All Log Levels
```bash
# Without correlation ID
curl http://localhost:3000/_debug/logs

# With correlation ID
curl -H "x-correlation-id: test-correlation-123" http://localhost:3000/_debug/logs
```

Expected outcome:
- All log levels (debug, info, warn, error, fatal) appear in logs
- Correlation ID is preserved when provided in header
- Each log entry contains enrichment fields (env, version, hostname)

### 2. Test Error Handling and Stack Traces
```bash
curl http://localhost:3000/_debug/error
```

Expected outcome:
- Full stack trace in error logs
- Error details properly structured
- Error propagation through logger

### 3. Test Performance Logging
```bash
# Test with different delays
curl "http://localhost:3000/_debug/slow?ms=100"
curl "http://localhost:3000/_debug/slow?ms=1500"
```

Expected outcome:
- Duration metrics in logs
- Warning logs for operations > 1000ms
- Accurate timing measurements

### 4. Test Data Masking
```bash
curl -X POST http://localhost:3000/_debug/masked \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "secret123",
    "creditCard": "4111111111111111",
    "email": "test@example.com",
    "personalInfo": {
      "ssn": "123-45-6789",
      "dateOfBirth": "1990-01-01"
    }
  }'
```

Expected outcome:
- Sensitive data properly masked in logs
- PII information redacted
- Non-sensitive data preserved

## File Rotation Test
```bash
# Generate lots of logs to trigger rotation
for i in {1..1000}; do
  curl "http://localhost:3000/_debug/logs"
  curl "http://localhost:3000/_debug/slow?ms=100"
done
```

Check:
- New log files created with date pattern
- Old logs compressed
- Respects max file size and retention period

## SEQ/Elasticsearch Transport Verification

1. Check SEQ Dashboard:
- Verify logs appear in SEQ interface
- Check correlation ID propagation
- Verify log structure and enrichment

2. Query Logs:
```bash
# Generate a log with unique correlation ID
curl -H "x-correlation-id: unique-test-id-$(date +%s)" http://localhost:3000/_debug/logs

# Check SEQ for the specific correlation ID
```

## Environment Variable Verification
```bash
# Test in different environments
NODE_ENV=development npm start
NODE_ENV=production npm start
```

Check:
- Log levels adjust based on environment
- Development shows debug logs
- Production shows info and above

## Validation Checklist

- [ ] All log levels work correctly
- [ ] Correlation IDs are generated and preserved
- [ ] File rotation works as expected
- [ ] SEQ/Elasticsearch receives logs
- [ ] Sensitive data is properly masked
- [ ] Performance metrics are accurate
- [ ] Stack traces are complete
- [ ] Environment variables affect logging
- [ ] Enrichment fields present in all logs
